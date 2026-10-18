#pragma once

#include <cstddef>
#include <optional>
#include <vector>

/**
 * @file Stack.h
 * @brief Linked-node Last-In-First-Out (LIFO) Stack ADT.
 *
 * Internal storage is managed using a singly linked list of dynamically allocated nodes.
 * No STL container is used internally.
 *
 * Time Complexities:
 * - push(item): O(1)
 * - pop(): O(1)
 * - peek(): O(1)
 * - isEmpty(): O(1)
 * - size(): O(1)
 * - toVector(): O(N)
 *
 * App Use:
 * Undo history of vault actions. Every vault mutation (add file, remove file)
 * is pushed; "Undo" pops and reverses the action.
 */

template <typename T>
class Stack {
private:
    struct Node {
        T data;
        Node* next;
        Node(const T& item, Node* nxt) : data(item), next(nxt) {}
    };

    Node* topNode;
    size_t count;

    void clear() {
        while (topNode != nullptr) {
            Node* temp = topNode;
            topNode = topNode->next;
            delete temp;
        }
        count = 0;
    }

public:
    Stack() : topNode(nullptr), count(0) {}

    // Disable copy to prevent accidental shallow copies, support move
    Stack(const Stack&) = delete;
    Stack& operator=(const Stack&) = delete;

    Stack(Stack&& other) noexcept : topNode(other.topNode), count(other.count) {
        other.topNode = nullptr;
        other.count = 0;
    }

    Stack& operator=(Stack&& other) noexcept {
        if (this != &other) {
            clear();
            topNode = other.topNode;
            count = other.count;
            other.topNode = nullptr;
            other.count = 0;
        }
        return *this;
    }

    ~Stack() {
        clear();
    }

    void push(const T& item) {
        topNode = new Node(item, topNode);
        ++count;
    }

    std::optional<T> pop() {
        if (isEmpty()) {
            return std::nullopt;
        }
        Node* temp = topNode;
        T val = temp->data;
        topNode = topNode->next;
        delete temp;
        --count;
        return val;
    }

    std::optional<T> peek() const {
        if (isEmpty()) {
            return std::nullopt;
        }
        return topNode->data;
    }

    bool isEmpty() const {
        return topNode == nullptr;
    }

    size_t size() const {
        return count;
    }

    /**
     * @brief Exports stack elements in bottom -> top order for inspection.
     */
    std::vector<T> toVector() const {
        std::vector<T> result;
        result.reserve(count);
        // Traverse top to bottom, then reverse so result is bottom -> top
        Node* curr = topNode;
        while (curr != nullptr) {
            result.push_back(curr->data);
            curr = curr->next;
        }
        // Reverse in place
        size_t n = result.size();
        for (size_t i = 0; i < n / 2; ++i) {
            T tmp = result[i];
            result[i] = result[n - 1 - i];
            result[n - 1 - i] = tmp;
        }
        return result;
    }
};
