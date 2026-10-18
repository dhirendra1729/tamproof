#pragma once

#include <cstddef>
#include <cstdint>
#include <string>
#include <vector>

/**
 * @file Huffman.h
 * @brief Lossless Huffman prefix coding tree constructed with MinHeap.
 *
 * Algorithm:
 * 1. Calculate byte frequencies over the input buffer.
 * 2. Push all non-zero frequency leaf nodes into MinHeap.
 * 3. Repeatedly extract two minimum frequency nodes, merge under a parent node,
 *    and reinsert into MinHeap until only the root remains.
 * 4. Generate prefix bit codes (0 = left, 1 = right) via binary tree traversal.
 *
 * Time Complexities:
 * - buildTree: O(K log K) where K <= 256 distinct byte values
 * - encode: O(N + K log K) where N is original byte count
 * - decode: O(bits)
 * - compressionRatio: O(1)
 *
 * App Use:
 * Real forensic evidence compression and space optimization ratio display.
 */

struct HuffmanNode {
    int byte;                 // 0-255 for leaves, -1 for internal
    uint64_t freq;
    HuffmanNode* left;
    HuffmanNode* right;

    HuffmanNode(int b, uint64_t f, HuffmanNode* l = nullptr, HuffmanNode* r = nullptr)
        : byte(b), freq(f), left(l), right(r) {}
};

class Huffman {
public:
    static HuffmanNode* buildTree(const std::vector<uint8_t>& data);
    static void codeTable(HuffmanNode* root, std::string table[256]);

    struct Encoded {
        std::string bits;
        HuffmanNode* tree;
    };

    static Encoded encode(const std::vector<uint8_t>& data);
    static std::vector<uint8_t> decode(const std::string& bits, HuffmanNode* tree);
    static double compressionRatio(size_t originalBytes, size_t encodedBits);
    static void freeTree(HuffmanNode* root);
};
