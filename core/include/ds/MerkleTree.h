#pragma once

#include <string>
#include <vector>

/**
 * @file MerkleTree.h
 * @brief Binary Merkle Tree implementation using hand-written SHA-256.
 *
 * Each leaf node represents the cryptographic SHA-256 fingerprint of an evidence file.
 * Each internal node is computed as sha256Hex(leftHash + rightHash).
 * Odd leaf counts duplicate the trailing leaf.
 * Every node is assigned a stable integer ID in build order for UI path illumination.
 * Internal nodes and tree edges are managed via raw pointers with full recursive RAII cleanup.
 *
 * Time Complexities:
 * - build(N): O(N)
 * - getRoot(): O(1)
 * - getProof(leafIndex): O(log N)
 * - verifyProof(proof): O(log N)
 * - findBrokenPath(): O(N)
 * - toJson(): O(N)
 *
 * App Use:
 * Cryptographic batch commitment of all stored evidence files and O(log N)
 * pinpointing of tampered files through the illuminated broken path.
 */

struct MerkleNode {
    int id;
    std::string hash;
    int leafIndex;              // -1 for internal nodes, 0..N-1 for leaves
    MerkleNode* left;
    MerkleNode* right;

    MerkleNode(int nodeId, const std::string& h, int leafIdx, MerkleNode* l = nullptr, MerkleNode* r = nullptr)
        : id(nodeId), hash(h), leafIndex(leafIdx), left(l), right(r) {}
};

struct ProofStep {
    std::string sibling;
    bool siblingIsLeft;
};

class MerkleTree {
private:
    MerkleNode* root;
    std::vector<std::string> storedLeafHashes;

    void freeTree(MerkleNode* node);
    MerkleNode* cloneSubtree(MerkleNode* node);
    bool findPathToLeaf(MerkleNode* node, int targetLeafIndex, std::vector<int>& path) const;
    bool findProofSteps(MerkleNode* node, int targetLeafIndex, std::vector<ProofStep>& steps) const;
    void nodeToJson(MerkleNode* node, std::string& out) const;

public:
    MerkleTree();
    ~MerkleTree();

    MerkleTree(const MerkleTree&) = delete;
    MerkleTree& operator=(const MerkleTree&) = delete;
    MerkleTree(MerkleTree&& other) noexcept;
    MerkleTree& operator=(MerkleTree&& other) noexcept;

    void build(const std::vector<std::string>& leafHashes);
    std::string getRoot() const;
    std::vector<ProofStep> getProof(int leafIndex) const;
    static bool verifyProof(const std::string& leafHash,
                            const std::vector<ProofStep>& proof,
                            const std::string& root);
    std::vector<int> findBrokenPath(const std::vector<std::string>& currentLeafHashes) const;
    std::string toJson() const;
};
