#pragma once

#include "ds/fnv1a.h"

#include <cstddef>
#include <string>
#include <utility>
#include <vector>

/**
 * @file HashTable.h
 * @brief Separate-chaining hash table ADT with hand-managed bucket nodes.
 *
 * Keys are hashed using 32-bit FNV-1a. Collisions are handled via singly linked
 * bucket chains. When the load factor exceeds 0.75, capacity is doubled and all
 * entries are rehashed into the new bucket array.
 * No STL container is used for internal storage.
 *
 * Time Complexities:
 * - set(key, value): O(1) average, O(N) worst case (O(N) during rehash)
 * - get(key): O(1) average, O(N) worst case
 * - erase(key): O(1) average, O(N) worst case
 * - has(key): O(1) average, O(N) worst case
 * - size(), loadFactor(), bucketCount(): O(1)
 * - bucketsSnapshot(): O(N + B)
 *
 * App Use:
 * Primary evidence index mapping file names to EvidenceFile records.
 */

template <typename V>
class HashTable {
public:
    struct BucketEntry {
        std::string key;
        V value;
    };

private:
    struct Node {
        std::string key;
        V value;
        Node* next;
        Node(const std::string& k, const V& val, Node* nxt)
            : key(k), value(val), next(nxt) {}
    };

    Node** buckets;
    size_t numBuckets;
    size_t numEntries;

    void clear() {
        if (buckets != nullptr) {
            for (size_t i = 0; i < numBuckets; ++i) {
                Node* curr = buckets[i];
                while (curr != nullptr) {
                    Node* tmp = curr;
                    curr = curr->next;
                    delete tmp;
                }
            }
            delete[] buckets;
            buckets = nullptr;
        }
        numBuckets = 0;
        numEntries = 0;
    }

    void rehash(size_t newCap) {
        if (newCap < 4) {
            newCap = 4;
        }
        Node** newBuckets = new Node*[newCap]();
        for (size_t i = 0; i < numBuckets; ++i) {
            Node* curr = buckets[i];
            while (curr != nullptr) {
                Node* nextNode = curr->next;
                size_t newIdx = fnv1a(curr->key) % newCap;
                curr->next = newBuckets[newIdx];
                newBuckets[newIdx] = curr;
                curr = nextNode;
            }
        }
        delete[] buckets;
        buckets = newBuckets;
        numBuckets = newCap;
    }

public:
    explicit HashTable(size_t initialCapacity = 16)
        : buckets(nullptr), numBuckets(initialCapacity < 4 ? 4 : initialCapacity), numEntries(0) {
        buckets = new Node*[numBuckets]();
    }

    // Disable copy, support move
    HashTable(const HashTable&) = delete;
    HashTable& operator=(const HashTable&) = delete;

    HashTable(HashTable&& other) noexcept
        : buckets(other.buckets), numBuckets(other.numBuckets), numEntries(other.numEntries) {
        other.buckets = nullptr;
        other.numBuckets = 0;
        other.numEntries = 0;
    }

    HashTable& operator=(HashTable&& other) noexcept {
        if (this != &other) {
            clear();
            buckets = other.buckets;
            numBuckets = other.numBuckets;
            numEntries = other.numEntries;
            other.buckets = nullptr;
            other.numBuckets = 0;
            other.numEntries = 0;
        }
        return *this;
    }

    ~HashTable() {
        clear();
    }

    void set(const std::string& key, const V& value) {
        size_t idx = fnv1a(key) % numBuckets;
        Node* curr = buckets[idx];
        while (curr != nullptr) {
            if (curr->key == key) {
                curr->value = value;
                return;
            }
            curr = curr->next;
        }

        // Check load factor before inserting
        if (static_cast<double>(numEntries + 1) / static_cast<double>(numBuckets) > 0.75) {
            rehash(numBuckets * 2);
            idx = fnv1a(key) % numBuckets;
        }

        buckets[idx] = new Node(key, value, buckets[idx]);
        ++numEntries;
    }

    V* get(const std::string& key) {
        if (numBuckets == 0) return nullptr;
        size_t idx = fnv1a(key) % numBuckets;
        Node* curr = buckets[idx];
        while (curr != nullptr) {
            if (curr->key == key) {
                return &(curr->value);
            }
            curr = curr->next;
        }
        return nullptr;
    }

    const V* get(const std::string& key) const {
        if (numBuckets == 0) return nullptr;
        size_t idx = fnv1a(key) % numBuckets;
        Node* curr = buckets[idx];
        while (curr != nullptr) {
            if (curr->key == key) {
                return &(curr->value);
            }
            curr = curr->next;
        }
        return nullptr;
    }

    bool erase(const std::string& key) {
        if (numBuckets == 0) return false;
        size_t idx = fnv1a(key) % numBuckets;
        Node* curr = buckets[idx];
        Node* prev = nullptr;

        while (curr != nullptr) {
            if (curr->key == key) {
                if (prev == nullptr) {
                    buckets[idx] = curr->next;
                } else {
                    prev->next = curr->next;
                }
                delete curr;
                --numEntries;
                return true;
            }
            prev = curr;
            curr = curr->next;
        }
        return false;
    }

    bool has(const std::string& key) const {
        return get(key) != nullptr;
    }

    size_t size() const {
        return numEntries;
    }

    double loadFactor() const {
        if (numBuckets == 0) return 0.0;
        return static_cast<double>(numEntries) / static_cast<double>(numBuckets);
    }

    size_t bucketCount() const {
        return numBuckets;
    }

    std::vector<std::vector<BucketEntry>> bucketsSnapshot() const {
        std::vector<std::vector<BucketEntry>> snapshot(numBuckets);
        for (size_t i = 0; i < numBuckets; ++i) {
            Node* curr = buckets[i];
            while (curr != nullptr) {
                snapshot[i].push_back(BucketEntry{curr->key, curr->value});
                curr = curr->next;
            }
        }
        return snapshot;
    }
};
