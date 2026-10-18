#include "ds/HashChain.h"
#include "ds/sha256.h"

#include <ctime>

namespace {
std::string currentUtcTimestamp() {
    std::time_t now = std::time(nullptr);
    std::tm tmBuf{};
    gmtime_r(&now, &tmBuf);
    char buf[32];
    std::strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &tmBuf);
    return std::string(buf);
}
} // namespace

HashChain::HashChain() : head(nullptr), tail(nullptr), count(0) {}

HashChain::~HashChain() {
    clear();
}

void HashChain::clear() {
    Node* curr = head;
    while (curr != nullptr) {
        Node* nextNode = curr->next;
        delete curr;
        curr = nextNode;
    }
    head = nullptr;
    tail = nullptr;
    count = 0;
}

HashChain::HashChain(HashChain&& other) noexcept
    : head(other.head), tail(other.tail), count(other.count) {
    other.head = nullptr;
    other.tail = nullptr;
    other.count = 0;
}

HashChain& HashChain::operator=(HashChain&& other) noexcept {
    if (this != &other) {
        clear();
        head = other.head;
        tail = other.tail;
        count = other.count;
        other.head = nullptr;
        other.tail = nullptr;
        other.count = 0;
    }
    return *this;
}

void HashChain::append(const std::string& action, const std::string& details) {
    Block b;
    b.index = count;
    b.timestamp = currentUtcTimestamp();
    b.action = action;
    b.details = details;
    b.prevHash = (tail == nullptr) ? "GENESIS" : tail->block.hash;
    b.hash = sha256Hex(std::to_string(b.index) + b.timestamp + b.action + b.details + b.prevHash);

    Node* newNode = new Node(b);
    if (tail == nullptr) {
        head = tail = newNode;
    } else {
        tail->next = newNode;
        tail = newNode;
    }
    ++count;
}

HashChain::VerifyResult HashChain::verify() const {
    Node* curr = head;
    Node* prev = nullptr;

    while (curr != nullptr) {
        std::string expectedHash = sha256Hex(std::to_string(curr->block.index) +
                                             curr->block.timestamp +
                                             curr->block.action +
                                             curr->block.details +
                                             curr->block.prevHash);
        if (curr->block.hash != expectedHash) {
            return VerifyResult{false, static_cast<int>(curr->block.index)};
        }
        if (prev != nullptr) {
            if (curr->block.prevHash != prev->block.hash) {
                return VerifyResult{false, static_cast<int>(curr->block.index)};
            }
        } else {
            if (curr->block.prevHash != "GENESIS") {
                return VerifyResult{false, static_cast<int>(curr->block.index)};
            }
        }
        prev = curr;
        curr = curr->next;
    }

    return VerifyResult{true, -1};
}

void HashChain::editBlockDetails(size_t index, const std::string& newDetails) {
    Node* curr = head;
    while (curr != nullptr) {
        if (curr->block.index == index) {
            curr->block.details = newDetails;
            return;
        }
        curr = curr->next;
    }
}

std::vector<Block> HashChain::toVector() const {
    std::vector<Block> result;
    result.reserve(count);
    Node* curr = head;
    while (curr != nullptr) {
        result.push_back(curr->block);
        curr = curr->next;
    }
    return result;
}
