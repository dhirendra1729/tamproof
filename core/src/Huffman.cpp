#include "ds/Huffman.h"
#include "ds/MinHeap.h"

namespace {

struct HuffmanNodeCmp {
    bool operator()(const HuffmanNode* a, const HuffmanNode* b) const {
        if (a->freq != b->freq) {
            return a->freq < b->freq;
        }
        return a->byte < b->byte;
    }
};

void generateCodes(HuffmanNode* node, const std::string& prefix, std::string table[256]) {
    if (node == nullptr) return;
    if (node->byte != -1) {
        table[node->byte] = prefix.empty() ? "0" : prefix;
        return;
    }
    generateCodes(node->left, prefix + "0", table);
    generateCodes(node->right, prefix + "1", table);
}

} // namespace

HuffmanNode* Huffman::buildTree(const std::vector<uint8_t>& data) {
    if (data.empty()) {
        return nullptr;
    }

    uint64_t freqs[256] = {0};
    for (uint8_t b : data) {
        ++freqs[b];
    }

    MinHeap<HuffmanNode*, HuffmanNodeCmp> heap;
    for (int i = 0; i < 256; ++i) {
        if (freqs[i] > 0) {
            heap.insert(new HuffmanNode(i, freqs[i]));
        }
    }

    if (heap.size() == 0) {
        return nullptr;
    }

    if (heap.size() == 1) {
        return heap.extractMin().value();
    }

    while (heap.size() > 1) {
        HuffmanNode* left = heap.extractMin().value();
        HuffmanNode* right = heap.extractMin().value();
        HuffmanNode* parent = new HuffmanNode(-1, left->freq + right->freq, left, right);
        heap.insert(parent);
    }

    return heap.extractMin().value();
}

void Huffman::codeTable(HuffmanNode* root, std::string table[256]) {
    for (int i = 0; i < 256; ++i) {
        table[i].clear();
    }
    if (root != nullptr) {
        generateCodes(root, "", table);
    }
}

Huffman::Encoded Huffman::encode(const std::vector<uint8_t>& data) {
    if (data.empty()) {
        return Encoded{"", nullptr};
    }

    HuffmanNode* tree = buildTree(data);
    std::string table[256];
    codeTable(tree, table);

    std::string bits;
    // Estimate size
    bits.reserve(data.size() * 4);
    for (uint8_t b : data) {
        bits.append(table[b]);
    }

    return Encoded{bits, tree};
}

std::vector<uint8_t> Huffman::decode(const std::string& bits, HuffmanNode* tree) {
    if (tree == nullptr) {
        return {};
    }

    // Single distinct byte edge case
    if (tree->left == nullptr && tree->right == nullptr) {
        std::vector<uint8_t> result;
        result.reserve(bits.size());
        for (size_t i = 0; i < bits.size(); ++i) {
            result.push_back(static_cast<uint8_t>(tree->byte));
        }
        return result;
    }

    std::vector<uint8_t> result;
    HuffmanNode* curr = tree;
    for (char bit : bits) {
        if (bit == '0') {
            curr = curr->left;
        } else if (bit == '1') {
            curr = curr->right;
        }

        if (curr != nullptr && curr->byte != -1) {
            result.push_back(static_cast<uint8_t>(curr->byte));
            curr = tree;
        }
    }

    return result;
}

double Huffman::compressionRatio(size_t originalBytes, size_t encodedBits) {
    if (originalBytes == 0) {
        return 0.0;
    }
    size_t compressedBytes = (encodedBits + 7) / 8;
    return static_cast<double>(compressedBytes) / static_cast<double>(originalBytes);
}

void Huffman::freeTree(HuffmanNode* root) {
    if (root == nullptr) return;
    freeTree(root->left);
    freeTree(root->right);
    delete root;
}
