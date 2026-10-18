#pragma once

#include <cstddef>
#include <optional>
#include <vector>

/**
 * @file CircularQueue.h
 * @brief Fixed-capacity circular queue (ring buffer) ADT over a hand-managed raw array.
 *
 * Internal storage is managed using a dynamically allocated raw array with head/tail
 * indices and modulo wraparound. No STL container is used internally.
 *
 * Time Complexities:
 * - enqueue(item): O(1)
 * - dequeue(): O(1)
 * - front(): O(1)
 * - isFull(): O(1)
 * - isEmpty(): O(1)
 * - size(): O(1)
 * - capacity(): O(1)
 * - toVector(): O(N)
 *
 * App Use:
 * File ingestion pipeline. Dropped files are enqueued; each process_next command
 * dequeues one file, hashes, compresses, and inserts it into the vault.
 */

template <typename T>
class CircularQueue {
private:
    T* buffer;
    size_t maxCapacity;
    size_t head;
    size_t tail;
    size_t count;

public:
    explicit CircularQueue(size_t capacity)
        : buffer(capacity > 0 ? new T[capacity] : nullptr),
          maxCapacity(capacity),
          head(0),
          tail(0),
          count(0) {}

    // Disable copy, support move
    CircularQueue(const CircularQueue&) = delete;
    CircularQueue& operator=(const CircularQueue&) = delete;

    CircularQueue(CircularQueue&& other) noexcept
        : buffer(other.buffer),
          maxCapacity(other.maxCapacity),
          head(other.head),
          tail(other.tail),
          count(other.count) {
        other.buffer = nullptr;
        other.maxCapacity = 0;
        other.head = 0;
        other.tail = 0;
        other.count = 0;
    }

    CircularQueue& operator=(CircularQueue&& other) noexcept {
        if (this != &other) {
            delete[] buffer;
            buffer = other.buffer;
            maxCapacity = other.maxCapacity;
            head = other.head;
            tail = other.tail;
            count = other.count;
            other.buffer = nullptr;
            other.maxCapacity = 0;
            other.head = 0;
            other.tail = 0;
            other.count = 0;
        }
        return *this;
    }

    ~CircularQueue() {
        delete[] buffer;
    }

    bool enqueue(const T& item) {
        if (isFull()) {
            return false;
        }
        buffer[tail] = item;
        tail = (tail + 1) % maxCapacity;
        ++count;
        return true;
    }

    std::optional<T> dequeue() {
        if (isEmpty()) {
            return std::nullopt;
        }
        T item = buffer[head];
        head = (head + 1) % maxCapacity;
        --count;
        return item;
    }

    std::optional<T> front() const {
        if (isEmpty()) {
            return std::nullopt;
        }
        return buffer[head];
    }

    bool isFull() const {
        return count == maxCapacity;
    }

    bool isEmpty() const {
        return count == 0;
    }

    size_t size() const {
        return count;
    }

    size_t capacity() const {
        return maxCapacity;
    }

    /**
     * @brief Exports elements in logical order (front -> rear) for the UI inspector.
     */
    std::vector<T> toVector() const {
        std::vector<T> result;
        result.reserve(count);
        for (size_t i = 0; i < count; ++i) {
            result.push_back(buffer[(head + i) % maxCapacity]);
        }
        return result;
    }
};
