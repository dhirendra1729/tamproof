#include "VaultCore.h"
#include "protocol.h"

#include <ctime>
#include <iomanip>
#include <sstream>

namespace {
std::string currentUtcTimestamp() {
    std::time_t now = std::time(nullptr);
    std::tm tmBuf{};
    gmtime_r(&now, &tmBuf);
    char buf[32];
    std::strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &tmBuf);
    return std::string(buf);
}
} // namespace

VaultCore::VaultCore()
    : fileIndex(16),
      ingestionQueue(64),
      currentMerkleRoot(""),
      prevMerkleRoot(""),
      nextFileNum(1),
      urgentSeq(0) {}

void VaultCore::reset() {
    fileIndex = HashTable<EvidenceFile>(16);
    fileOrder.clear();
    ingestionQueue = CircularQueue<QueuedFile>(64);
    undoStack = Stack<UndoAction>();
    urgentHeap = MinHeap<UrgentEntry, UrgentCmp>();
    merkleTree = MerkleTree();
    hashChain = HashChain();
    currentMerkleRoot.clear();
    prevMerkleRoot.clear();
    nextFileNum = 1;
    urgentSeq = 0;
}

bool VaultCore::enqueue(const std::string& name, const std::vector<uint8_t>& bytes) {
    return ingestionQueue.enqueue(QueuedFile{name, bytes});
}

void VaultCore::rebuildMerkle() {
    prevMerkleRoot = currentMerkleRoot;
    std::vector<std::string> leaves = getStoredLeafHashes();
    merkleTree.build(leaves);
    currentMerkleRoot = merkleTree.getRoot();
}

std::vector<std::string> VaultCore::getStoredLeafHashes() const {
    std::vector<std::string> leaves;
    leaves.reserve(fileOrder.size());
    for (const auto& name : fileOrder) {
        const EvidenceFile* f = fileIndex.get(name);
        if (f != nullptr) {
            leaves.push_back(f->storedHash);
        }
    }
    return leaves;
}

bool VaultCore::processNext(EvidenceFile& outProcessed) {
    auto itemOpt = ingestionQueue.dequeue();
    if (!itemOpt.has_value()) {
        return false;
    }

    QueuedFile item = itemOpt.value();
    std::string hash = sha256Hex(item.bytes.data(), item.bytes.size());

    auto enc = Huffman::encode(item.bytes);
    size_t bits = enc.bits.size();
    double ratio = Huffman::compressionRatio(item.bytes.size(), bits);
    Huffman::freeTree(enc.tree);

    std::string addedAt = currentUtcTimestamp();
    std::string fileId = "f" + std::to_string(nextFileNum++);

    EvidenceFile* existing = fileIndex.get(item.name);
    if (existing != nullptr) {
        EvidenceFile oldFile = *existing;
        EvidenceFile rec{fileId, item.name, item.bytes.size(), item.bytes, hash, bits, ratio, addedAt, "secured"};
        fileIndex.set(item.name, rec);
        undoStack.push(UndoAction{UndoAction::REPLACE, fileId, item.name, oldFile, "REPLACE " + item.name});
        rebuildMerkle();
        hashChain.append("REPLACE", item.name);
        outProcessed = rec;
    } else {
        EvidenceFile rec{fileId, item.name, item.bytes.size(), item.bytes, hash, bits, ratio, addedAt, "secured"};
        fileIndex.set(item.name, rec);
        fileOrder.push_back(item.name);
        undoStack.push(UndoAction{UndoAction::ADD, fileId, item.name, EvidenceFile{}, "ADD " + item.name});
        rebuildMerkle();
        hashChain.append("ADD", item.name);
        outProcessed = rec;
    }

    return true;
}

std::string VaultCore::verifyIntegrity() {
    std::string rootBefore = currentMerkleRoot;
    std::vector<std::string> tamperedIds;
    std::vector<std::string> currentLeafHashes;
    currentLeafHashes.reserve(fileOrder.size());

    for (const auto& name : fileOrder) {
        EvidenceFile* f = fileIndex.get(name);
        if (f != nullptr) {
            std::string curHash = sha256Hex(f->bytes.data(), f->bytes.size());
            if (curHash != f->storedHash) {
                tamperedIds.push_back(f->id);
                f->status = "tampered";
            }
            currentLeafHashes.push_back(curHash);
        }
    }

    std::vector<int> brokenPath = merkleTree.findBrokenPath(currentLeafHashes);

    MerkleTree recomputedTree;
    recomputedTree.build(currentLeafHashes);
    std::string rootAfter = recomputedTree.getRoot();

    auto chainVerify = hashChain.verify();

    bool clean = tamperedIds.empty() && chainVerify.valid &&
                 (rootBefore == rootAfter || currentLeafHashes.empty());

    if (clean) {
        hashChain.append("VERIFY", "All " + std::to_string(fileOrder.size()) + " files intact");
    } else {
        hashChain.append("VERIFY FAILED", "Integrity violation detected (" + std::to_string(tamperedIds.size()) + " tampered files)");
    }

    // Build result JSON
    std::string out = "{";
    out += "\"tampered\":[";
    for (size_t i = 0; i < tamperedIds.size(); ++i) {
        if (i > 0) out += ",";
        out += "\"" + protocol::escapeJson(tamperedIds[i]) + "\"";
    }
    out += "],\"brokenPath\":[";
    for (size_t i = 0; i < brokenPath.size(); ++i) {
        if (i > 0) out += ",";
        out += std::to_string(brokenPath[i]);
    }
    out += "],\"chainValid\":";
    out += (chainVerify.valid ? "true" : "false");
    out += ",\"brokenAt\":";
    out += std::to_string(chainVerify.brokenAt);
    out += ",\"rootBefore\":\"" + protocol::escapeJson(rootBefore) + "\"";
    out += ",\"rootAfter\":\"" + protocol::escapeJson(rootAfter) + "\"";
    out += "}";

    return out;
}

bool VaultCore::simulateTamper(const std::string& fileId) {
    for (const auto& name : fileOrder) {
        EvidenceFile* f = fileIndex.get(name);
        if (f != nullptr && f->id == fileId) {
            if (f->bytes.empty()) {
                f->bytes.push_back(0xFF);
            } else {
                size_t idx = f->bytes.size() / 2;
                f->bytes[idx] ^= 0xFF;
            }
            // Attacker is silent: do NOT change status or log to audit chain here!
            return true;
        }
    }
    return false;
}

bool VaultCore::tamperChainBlock(size_t index, const std::string& newDetails) {
    hashChain.editBlockDetails(index, newDetails);
    return true;
}

bool VaultCore::undo() {
    if (undoStack.isEmpty()) {
        return false;
    }

    UndoAction action = undoStack.pop().value();
    if (action.type == UndoAction::ADD) {
        fileIndex.erase(action.fileName);
        for (auto it = fileOrder.begin(); it != fileOrder.end(); ++it) {
            if (*it == action.fileName) {
                fileOrder.erase(it);
                break;
            }
        }
        rebuildMerkle();
        hashChain.append("UNDO", "Reversed " + action.description);
        return true;
    } else if (action.type == UndoAction::REPLACE) {
        fileIndex.set(action.fileName, action.previousFile);
        rebuildMerkle();
        hashChain.append("UNDO", "Reversed " + action.description);
        return true;
    }

    return false;
}

bool VaultCore::flagUrgent(const std::string& fileId) {
    urgentHeap.insert(UrgentEntry{fileId, ++urgentSeq});
    return true;
}

bool VaultCore::processUrgent(std::string& outResult) {
    if (urgentHeap.size() == 0) {
        return false;
    }

    UrgentEntry entry = urgentHeap.extractMin().value();
    for (const auto& name : fileOrder) {
        EvidenceFile* f = fileIndex.get(name);
        if (f != nullptr && f->id == entry.fileId) {
            std::string curH = sha256Hex(f->bytes.data(), f->bytes.size());
            bool intact = (curH == f->storedHash);
            if (intact) {
                hashChain.append("URGENT_VERIFIED", "Urgent verify clean: " + f->name);
            } else {
                f->status = "tampered";
                hashChain.append("URGENT_FAILED", "Urgent verify FAILED: " + f->name);
            }
            outResult = "{\"fileId\":\"" + protocol::escapeJson(f->id) + "\",\"intact\":" + (intact ? "true" : "false") + "}";
            return true;
        }
    }

    outResult = "{\"fileId\":\"" + protocol::escapeJson(entry.fileId) + "\",\"intact\":false,\"error\":\"not found\"}";
    return true;
}

std::string VaultCore::stateJson() {
    std::ostringstream ss;
    ss << "{";

    // "files": [...]
    ss << "\"files\":[";
    bool first = true;
    for (const auto& name : fileOrder) {
        const EvidenceFile* f = fileIndex.get(name);
        if (f != nullptr) {
            if (!first) ss << ",";
            first = false;
            ss << "{\"id\":\"" << protocol::escapeJson(f->id) << "\""
               << ",\"name\":\"" << protocol::escapeJson(f->name) << "\""
               << ",\"size\":" << f->size
               << ",\"storedHash\":\"" << protocol::escapeJson(f->storedHash) << "\""
               << ",\"huffmanBits\":" << f->huffmanBits
               << ",\"compressionRatio\":" << std::fixed << std::setprecision(2) << f->compressionRatio
               << ",\"addedAt\":\"" << protocol::escapeJson(f->addedAt) << "\""
               << ",\"status\":\"" << protocol::escapeJson(f->status) << "\"}";
        }
    }
    ss << "],";

    // "merkleRoot", "prevMerkleRoot", "merkleTree"
    ss << "\"merkleRoot\":\"" << protocol::escapeJson(currentMerkleRoot) << "\",";
    ss << "\"prevMerkleRoot\":\"" << protocol::escapeJson(prevMerkleRoot) << "\",";
    ss << "\"merkleTree\":" << merkleTree.toJson() << ",";

    // "chain": [...]
    ss << "\"chain\":[";
    auto blocks = hashChain.toVector();
    for (size_t i = 0; i < blocks.size(); ++i) {
        if (i > 0) ss << ",";
        const auto& b = blocks[i];
        ss << "{\"index\":" << b.index
           << ",\"timestamp\":\"" << protocol::escapeJson(b.timestamp) << "\""
           << ",\"action\":\"" << protocol::escapeJson(b.action) << "\""
           << ",\"details\":\"" << protocol::escapeJson(b.details) << "\""
           << ",\"prevHash\":\"" << protocol::escapeJson(b.prevHash) << "\""
           << ",\"hash\":\"" << protocol::escapeJson(b.hash) << "\"}";
    }
    ss << "],";

    // "buckets": [[{"key":"note.txt","chain":0}], ...]
    ss << "\"buckets\":[";
    auto bSnapshot = fileIndex.bucketsSnapshot();
    for (size_t i = 0; i < bSnapshot.size(); ++i) {
        if (i > 0) ss << ",";
        ss << "[";
        for (size_t j = 0; j < bSnapshot[i].size(); ++j) {
            if (j > 0) ss << ",";
            ss << "{\"key\":\"" << protocol::escapeJson(bSnapshot[i][j].key) << "\""
               << ",\"chain\":" << j << "}";
        }
        ss << "]";
    }
    ss << "],";

    // "stack": [...]
    ss << "\"stack\":[";
    auto st = undoStack.toVector();
    for (size_t i = 0; i < st.size(); ++i) {
        if (i > 0) ss << ",";
        ss << "\"" << protocol::escapeJson(st[i].description) << "\"";
    }
    ss << "],";

    // "queue": [...]
    ss << "\"queue\":[";
    auto q = ingestionQueue.toVector();
    for (size_t i = 0; i < q.size(); ++i) {
        if (i > 0) ss << ",";
        ss << "\"" << protocol::escapeJson(q[i].name) << "\"";
    }
    ss << "],";

    // "urgentHeap": [...]
    ss << "\"urgentHeap\":[";
    auto uh = urgentHeap.toVector();
    for (size_t i = 0; i < uh.size(); ++i) {
        if (i > 0) ss << ",";
        ss << "\"" << protocol::escapeJson(uh[i].fileId) << "\"";
    }
    ss << "],";

    // "chainValid": bool
    auto cVer = hashChain.verify();
    ss << "\"chainValid\":" << (cVer.valid ? "true" : "false");

    ss << "}";
    return ss.str();
}
