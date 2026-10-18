#pragma once

#include "ds/CircularQueue.h"
#include "ds/HashChain.h"
#include "ds/HashTable.h"
#include "ds/Huffman.h"
#include "ds/MerkleTree.h"
#include "ds/MinHeap.h"
#include "ds/Stack.h"
#include "ds/sha256.h"

#include <cstdint>
#include <string>
#include <vector>

struct EvidenceFile {
    std::string id;              // "f1", "f2", ... assigned by the core
    std::string name;
    size_t size;                 // original bytes
    std::vector<uint8_t> bytes;  // current stored bytes (Attacker Mode mutates THIS)
    std::string storedHash;      // SHA-256 recorded at ingestion
    size_t huffmanBits;          // encoded size in bits
    double compressionRatio;
    std::string addedAt;
    std::string status;          // "queued" | "processing" | "secured" | "tampered"
};

struct QueuedFile {
    std::string name;
    std::vector<uint8_t> bytes;
};

struct UndoAction {
    enum Type { ADD, REPLACE };
    Type type;
    std::string fileId;
    std::string fileName;
    EvidenceFile previousFile; // only if REPLACE
    std::string description;
};

struct UrgentEntry {
    std::string fileId;
    uint64_t sequence;
};

struct UrgentCmp {
    bool operator()(const UrgentEntry& a, const UrgentEntry& b) const {
        return a.sequence < b.sequence;
    }
};

class VaultCore {
private:
    HashTable<EvidenceFile> fileIndex;
    std::vector<std::string> fileOrder; // tracks all active file keys in insertion order
    CircularQueue<QueuedFile> ingestionQueue;
    Stack<UndoAction> undoStack;
    MinHeap<UrgentEntry, UrgentCmp> urgentHeap;
    MerkleTree merkleTree;
    HashChain hashChain;

    std::string currentMerkleRoot;
    std::string prevMerkleRoot;
    size_t nextFileNum;
    uint64_t urgentSeq;

    void rebuildMerkle();
    std::vector<std::string> getStoredLeafHashes() const;

public:
    VaultCore();

    bool enqueue(const std::string& name, const std::vector<uint8_t>& bytes);
    bool processNext(EvidenceFile& outProcessed);
    std::string verifyIntegrity();
    bool simulateTamper(const std::string& fileId);
    bool tamperChainBlock(size_t index, const std::string& newDetails);
    bool undo();
    bool flagUrgent(const std::string& fileId);
    bool processUrgent(std::string& outResult);
    std::string stateJson();
    void reset();

    // Direct access for selftests
    const HashTable<EvidenceFile>& getTable() const { return fileIndex; }
    const HashChain& getChain() const { return hashChain; }
    const MerkleTree& getMerkle() const { return merkleTree; }
};
