#pragma once

#include <cstddef>
#include <functional>
#include <optional>
#include <utility>
#include <vector>

/**
 * @file MinHeap.h
 * @brief Binary min-heap priority queue over a hand-managed dynamic array.
 *
 * Internal storage is managed using a raw dynamically allocated array with manual
 * capacity doubling. No STL container is used internally.
 *
 * Time Complexities:
 * - insert(item): O(log N)
 * - extractMin(): O(log N)
 * - peek(): O(1)
 * - size(): O(1)
 * - toVector(): O(N)
 *
 * App Use:
 * (a) Huffman coding: repeatedly extract the two lowest-frequency nodes.
 * (b) Urgent verify queue: files flagged urgent jump the verification line.
 */

template <typename T, typename Compare = std::less<T>>
class MinHeap {
private:
    T* data;
    size_t count;
    size_t cap;
    Compare cmp;

    void grow() {
        size_t newCap = cap == 0 ? 8 : cap * 2;
        T* newData = new T[newCap];
        for (size_t i = 0; i < count; ++i) {
            newData[i] = std::move(data[i]);
        }
        delete[] data;
        data = newData;
        cap = newCap;
    }

    void siftUp(size_t index) {
        while (index > 0) {
            size_t parent = (index - 1) / 2;
            if (cmp(data[index], data[parent])) {
                std::swap(data[index], data[parent]);
                index = parent;
            } else {
                break;
            }
        }
    }

    void siftDown(size_t index) {
        while (true) {
            size_t smallest = index;
            size_t left = 2 * index + 1;
            size_t right = 2 * index + 2;

            if (left < count && cmp(data[left], data[smallest])) {
                smallest = left;
            }
            if (right < count && cmp(data[right], data[smallest])) {
                smallest = right;
            }

            if (smallest != index) {
                std::swap(data[index], data[smallest]);
                index = smallest;
            } else {
                break;
            }
        }
    }

public:
    explicit MinHeap(Compare compare = Compare{})
        : data(nullptr), count(0), cap(0), cmp(compare) {}

    // Disable copy, support move
    MinHeap(const MinHeap&) = delete;
    MinHeap& operator=(const MinHeap&) = delete;

    MinHeap(MinHeap&& other) noexcept
        : data(other.data), count(other.count), cap(other.cap), cmp(other.cmp) {
        other.data = nullptr;
        other.count = 0;
        other.cap = 0;
    }

    MinHeap& operator=(MinHeap&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = other.data;
            count = other.count;
            cap = other.cap;
            cmp = other.cmp;
            other.data = nullptr;
            other.count = 0;
            other.cap = 0;
        }
        return *this;
    }

    ~MinHeap() {
        delete[] data;
    }

    void insert(const T& item) {
        if (count >= cap) {
            grow();
        }
        data[count] = item;
        siftUp(count);
        ++count;
    }

    std::optional<T> extractMin() {
        if (count == 0) {
            return std::nullopt;
        }
        T minVal = data[0];
        data[0] = data[count - 1];
        --count;
        if (count > 0) {
            siftDown(0);
        }
        return minVal;
    }

    std::optional<T> peek() const {
        if (count == 0) {
            return std::nullopt;
        }
        return data[0];
    }

    size_t size() const {
        return count;
    }

    std::vector<T> toVector() const {
        std::vector<T> result;
        result.reserve(count);
        for (size_t i = 0; i < count; ++i) {
            result.push_back(data[i]);
        }
        return result;
    }
};
