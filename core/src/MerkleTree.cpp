#include "ds/MerkleTree.h"
#include "ds/sha256.h"

#include <algorithm>

MerkleTree::MerkleTree() : root(nullptr) {}

MerkleTree::~MerkleTree() {
    freeTree(root);
}

void MerkleTree::freeTree(MerkleNode* node) {
    if (node == nullptr) return;
    freeTree(node->left);
    freeTree(node->right);
    delete node;
}

MerkleTree::MerkleTree(MerkleTree&& other) noexcept
    : root(other.root), storedLeafHashes(std::move(other.storedLeafHashes)) {
    other.root = nullptr;
}

MerkleTree& MerkleTree::operator=(MerkleTree&& other) noexcept {
    if (this != &other) {
        freeTree(root);
        root = other.root;
        storedLeafHashes = std::move(other.storedLeafHashes);
        other.root = nullptr;
    }
    return *this;
}

void MerkleTree::build(const std::vector<std::string>& leafHashes) {
    freeTree(root);
    root = nullptr;
    storedLeafHashes = leafHashes;

    if (leafHashes.empty()) {
        return;
    }

    int nextId = 1;
    if (leafHashes.size() == 1) {
        root = new MerkleNode(nextId++, leafHashes[0], 0, nullptr, nullptr);
        return;
    }

    std::vector<MerkleNode*> currentLevel;
    currentLevel.reserve(leafHashes.size() + 1);

    for (size_t i = 0; i < leafHashes.size(); ++i) {
        currentLevel.push_back(new MerkleNode(nextId++, leafHashes[i], static_cast<int>(i)));
    }

    while (currentLevel.size() > 1) {
        if (currentLevel.size() % 2 == 1) {
            // Duplicate the last node per standard Merkle tree specification
            MerkleNode* last = currentLevel.back();
            MerkleNode* dup = new MerkleNode(nextId++, last->hash, last->leafIndex);
            currentLevel.push_back(dup);
        }

        std::vector<MerkleNode*> nextLevel;
        nextLevel.reserve(currentLevel.size() / 2);

        for (size_t i = 0; i < currentLevel.size(); i += 2) {
            MerkleNode* left = currentLevel[i];
            MerkleNode* right = currentLevel[i + 1];
            std::string parentHash = sha256Hex(left->hash + right->hash);
            MerkleNode* parent = new MerkleNode(nextId++, parentHash, -1, left, right);
            nextLevel.push_back(parent);
        }

        currentLevel = std::move(nextLevel);
    }

    root = currentLevel[0];
}

std::string MerkleTree::getRoot() const {
    if (root == nullptr) {
        return "";
    }
    return root->hash;
}

bool MerkleTree::findProofSteps(MerkleNode* node, int targetLeafIndex, std::vector<ProofStep>& steps) const {
    if (node == nullptr) return false;
    if (node->left == nullptr && node->right == nullptr) {
        return node->leafIndex == targetLeafIndex;
    }

    // Check left subtree
    if (findProofSteps(node->left, targetLeafIndex, steps)) {
        if (node->right != nullptr) {
            steps.push_back(ProofStep{node->right->hash, false});
        }
        return true;
    }

    // Check right subtree
    if (findProofSteps(node->right, targetLeafIndex, steps)) {
        if (node->left != nullptr) {
            steps.push_back(ProofStep{node->left->hash, true});
        }
        return true;
    }

    return false;
}

std::vector<ProofStep> MerkleTree::getProof(int leafIndex) const {
    std::vector<ProofStep> steps;
    if (root != nullptr) {
        findProofSteps(root, leafIndex, steps);
    }
    return steps;
}

bool MerkleTree::verifyProof(const std::string& leafHash,
                            const std::vector<ProofStep>& proof,
                            const std::string& expectedRoot) {
    std::string current = leafHash;
    for (const auto& step : proof) {
        if (step.siblingIsLeft) {
            current = sha256Hex(step.sibling + current);
        } else {
            current = sha256Hex(current + step.sibling);
        }
    }
    return current == expectedRoot;
}

bool MerkleTree::findPathToLeaf(MerkleNode* node, int targetLeafIndex, std::vector<int>& path) const {
    if (node == nullptr) return false;
    path.push_back(node->id);

    if (node->left == nullptr && node->right == nullptr) {
        if (node->leafIndex == targetLeafIndex) {
            return true;
        }
        path.pop_back();
        return false;
    }

    if (findPathToLeaf(node->left, targetLeafIndex, path)) {
        return true;
    }
    if (findPathToLeaf(node->right, targetLeafIndex, path)) {
        return true;
    }

    path.pop_back();
    return false;
}

std::vector<int> MerkleTree::findBrokenPath(const std::vector<std::string>& currentLeafHashes) const {
    if (root == nullptr || storedLeafHashes.empty() || currentLeafHashes.empty()) {
        return {};
    }

    // Check which leaf changed
    int changedLeafIdx = -1;
    size_t minSize = std::min(storedLeafHashes.size(), currentLeafHashes.size());
    for (size_t i = 0; i < minSize; ++i) {
        if (storedLeafHashes[i] != currentLeafHashes[i]) {
            changedLeafIdx = static_cast<int>(i);
            break;
        }
    }

    if (changedLeafIdx == -1 && storedLeafHashes.size() != currentLeafHashes.size()) {
        changedLeafIdx = static_cast<int>(minSize);
    }

    if (changedLeafIdx == -1) {
        return {};
    }

    // Build the path from root down to the leaf node with leafIndex == changedLeafIdx
    std::vector<int> pathRootToLeaf;
    findPathToLeaf(root, changedLeafIdx, pathRootToLeaf);

    // Return leaf id first, root id last
    std::vector<int> brokenPath(pathRootToLeaf.rbegin(), pathRootToLeaf.rend());
    return brokenPath;
}

void MerkleTree::nodeToJson(MerkleNode* node, std::string& out) const {
    if (node == nullptr) {
        out += "null";
        return;
    }
    out += "{\"id\":";
    out += std::to_string(node->id);
    out += ",\"hash\":\"";
    out += node->hash;
    out += "\",\"leafIndex\":";
    out += std::to_string(node->leafIndex);
    out += ",\"left\":";
    nodeToJson(node->left, out);
    out += ",\"right\":";
    nodeToJson(node->right, out);
    out += "}";
}

std::string MerkleTree::toJson() const {
    if (root == nullptr) {
        return "null";
    }
    std::string out;
    out.reserve(1024);
    nodeToJson(root, out);
    return out;
}
