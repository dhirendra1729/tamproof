#pragma once

#include <cstddef>
#include <string>
#include <vector>

/**
 * @file HashChain.h
 * @brief Hash-chained audit log implemented as a singly linked list of blocks.
 *
 * Each block records an immutable event in the vault lifecycle:
 * Block { index, timestamp, action, details, prevHash, hash }
 * where:
 * hash = sha256Hex(std::to_string(index) + timestamp + action + details + prevHash)
 * For index 0, prevHash = "GENESIS".
 *
 * Verification recomputes all block hashes and verifies cryptographic link continuity.
 * Attacker mode can edit block details, which immediately invalidates the chain link.
 *
 * Time Complexities:
 * - append(action, details): O(1) amortized with tail pointer
 * - verify(): O(N)
 * - editBlockDetails(index, details): O(N)
 * - toVector(): O(N)
 *
 * App Use:
 * Cryptographic, append-only forensic audit log.
 */

struct Block {
    size_t index;
    std::string timestamp;   // ISO-8601 UTC
    std::string action;      // "ADD", "VERIFY", "TAMPER_DETECTED", "UNDO", ...
    std::string details;
    std::string prevHash;
    std::string hash;
};

class HashChain {
private:
    struct Node {
        Block block;
        Node* next;
        explicit Node(const Block& b) : block(b), next(nullptr) {}
    };

    Node* head;
    Node* tail;
    size_t count;

    void clear();

public:
    struct VerifyResult {
        bool valid;
        int brokenAt;        // -1 when valid, or 0-based index of first corrupted block
    };

    HashChain();
    ~HashChain();

    HashChain(const HashChain&) = delete;
    HashChain& operator=(const HashChain&) = delete;
    HashChain(HashChain&& other) noexcept;
    HashChain& operator=(HashChain&& other) noexcept;

    void append(const std::string& action, const std::string& details);
    VerifyResult verify() const;
    void editBlockDetails(size_t index, const std::string& newDetails);
    std::vector<Block> toVector() const;
    size_t size() const { return count; }
};
