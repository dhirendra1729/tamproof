#include "VaultCore.h"
#include "base64.h"
#include "ds/CircularQueue.h"
#include "ds/HashChain.h"
#include "ds/HashTable.h"
#include "ds/Huffman.h"
#include "ds/MerkleTree.h"
#include "ds/MinHeap.h"
#include "ds/Stack.h"
#include "ds/fnv1a.h"
#include "ds/sha256.h"
#include "protocol.h"

#include <cassert>
#include <iostream>
#include <numeric>
#include <string>
#include <vector>

void testStack() {
    Stack<int> s;
    assert(s.isEmpty());
    assert(s.size() == 0);
    assert(!s.pop().has_value());
    assert(!s.peek().has_value());

    s.push(10);
    s.push(20);
    s.push(30);
    assert(s.size() == 3);
    assert(s.peek().value() == 30);

    auto vec = s.toVector(); // bottom -> top: 10, 20, 30
    assert(vec.size() == 3);
    assert(vec[0] == 10);
    assert(vec[1] == 20);
    assert(vec[2] == 30);

    assert(s.pop().value() == 30);
    assert(s.pop().value() == 20);
    assert(s.pop().value() == 10);
    assert(!s.pop().has_value());
    assert(s.isEmpty());
    assert(s.size() == 0);

    std::cout << "[PASS] Test 1: Stack (LIFO order, pop on empty returns nullopt)\n";
}

void testCircularQueue() {
    CircularQueue<int> q(4);
    assert(q.isEmpty());
    assert(!q.isFull());
    assert(q.capacity() == 4);
    assert(!q.dequeue().has_value());

    assert(q.enqueue(1));
    assert(q.enqueue(2));
    assert(q.enqueue(3));
    assert(q.enqueue(4));
    assert(q.isFull());
    assert(!q.enqueue(5)); // false when full

    // Drain half
    assert(q.dequeue().value() == 1);
    assert(q.dequeue().value() == 2);
    assert(q.size() == 2);

    // Refill past capacity boundary (wraparound)
    assert(q.enqueue(5));
    assert(q.enqueue(6));
    assert(q.isFull());

    auto vec = q.toVector(); // logical order: 3, 4, 5, 6
    assert(vec.size() == 4);
    assert(vec[0] == 3);
    assert(vec[1] == 4);
    assert(vec[2] == 5);
    assert(vec[3] == 6);

    assert(q.dequeue().value() == 3);
    assert(q.dequeue().value() == 4);
    assert(q.dequeue().value() == 5);
    assert(q.dequeue().value() == 6);
    assert(!q.dequeue().has_value());
    assert(q.isEmpty());

    std::cout << "[PASS] Test 2: CircularQueue (FIFO, wraparound across capacity boundary, full check)\n";
}

void testMinHeap() {
    MinHeap<int> heap;
    assert(heap.size() == 0);
    assert(!heap.peek().has_value());
    assert(!heap.extractMin().has_value());

    int items[] = {5, 1, 9, 3, 7};
    for (int x : items) {
        heap.insert(x);
    }
    assert(heap.size() == 5);
    assert(heap.peek().value() == 1);

    assert(heap.extractMin().value() == 1);
    assert(heap.extractMin().value() == 3);
    assert(heap.extractMin().value() == 5);
    assert(heap.extractMin().value() == 7);
    assert(heap.extractMin().value() == 9);
    assert(!heap.extractMin().has_value());
    assert(heap.size() == 0);

    std::cout << "[PASS] Test 3: MinHeap (insert [5,1,9,3,7] extracts 1,3,5,7,9; peek before extract)\n";
}

void testHashTable() {
    HashTable<std::string> table(4);
    assert(table.bucketCount() == 4);
    assert(table.size() == 0);

    // Find keys that hash to bucket 0 modulo 4 to force collisions
    std::vector<std::string> collidingKeys;
    for (int i = 0; collidingKeys.size() < 3 && i < 1000; ++i) {
        std::string candidate = "test_key_" + std::to_string(i);
        if (fnv1a(candidate) % 4 == 0) {
            collidingKeys.push_back(candidate);
        }
    }
    assert(collidingKeys.size() == 3);

    // Insert colliding keys into table
    table.set(collidingKeys[0], "val_0");
    table.set(collidingKeys[1], "val_1");
    table.set(collidingKeys[2], "val_2");

    assert(table.has(collidingKeys[0]));
    assert(table.has(collidingKeys[1]));
    assert(table.has(collidingKeys[2]));
    assert(*table.get(collidingKeys[0]) == "val_0");
    assert(*table.get(collidingKeys[1]) == "val_1");
    assert(*table.get(collidingKeys[2]) == "val_2");

    // Check collision chain snapshot
    auto snap = table.bucketsSnapshot();
    assert(snap.size() == 4);
    assert(snap[0].size() >= 3);

    // Trigger rehash above load factor 0.75
    // Current load factor with 3 entries / 4 buckets = 0.75
    table.set("key_trigger_rehash", "val_trigger");
    assert(table.bucketCount() > 4); // rehash triggered
    assert(table.loadFactor() <= 0.75);
    assert(table.has("key_trigger_rehash"));
    assert(*table.get("key_trigger_rehash") == "val_trigger");

    // Test erase and size
    size_t prevSize = table.size();
    assert(table.erase(collidingKeys[0]));
    assert(!table.has(collidingKeys[0]));
    assert(table.get(collidingKeys[0]) == nullptr);
    assert(table.size() == prevSize - 1);
    assert(!table.erase("non_existent_key"));

    std::cout << "[PASS] Test 4: HashTable (set/get/erase, >=3 collisions at cap 4, rehash at >0.75, size)\n";
}

void testFnv1a() {
    std::string s1 = "evidence_file_2026";
    std::string s2 = "evidence_file_2026";
    assert(fnv1a(s1) == fnv1a(s2));

    assert(fnv1a("a") != fnv1a("b"));
    assert(fnv1a("x") != fnv1a("y"));
    assert(fnv1a("data1") != fnv1a("data2"));

    std::cout << "[PASS] Test 5: fnv1a (determinism, collision resistance for one-letter differences)\n";
}

void testSha256() {
    // 1. Empty string
    std::string hEmpty = sha256Hex("");
    assert(hEmpty == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");

    // 2. "abc"
    std::string hAbc = sha256Hex("abc");
    assert(hAbc == "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");

    // 3. "The quick brown fox jumps over the lazy dog"
    std::string hFox = sha256Hex("The quick brown fox jumps over the lazy dog");
    assert(hFox == "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592");

    std::cout << "[PASS] Test 6: SHA-256 (NIST FIPS 180-4 known answer test vectors)\n";
}

void testMerkleTree() {
    std::string a = sha256Hex("leaf_a");
    std::string b = sha256Hex("leaf_b");
    std::vector<std::string> leaves = {a, b};

    MerkleTree tree;
    tree.build(leaves);
    std::string expectedRoot = sha256Hex(a + b);
    assert(tree.getRoot() == expectedRoot);

    // Verify proofs for both leaves
    auto proof0 = tree.getProof(0);
    assert(MerkleTree::verifyProof(a, proof0, expectedRoot));

    auto proof1 = tree.getProof(1);
    assert(MerkleTree::verifyProof(b, proof1, expectedRoot));

    // Flip leaf 1 and check findBrokenPath
    std::string tamperedB = sha256Hex("tampered_leaf_b");
    std::vector<std::string> tamperedLeaves = {a, tamperedB};
    std::vector<int> brokenPath = tree.findBrokenPath(tamperedLeaves);

    assert(!brokenPath.empty());
    // Path must start at the changed leaf's node id and end at the root id
    // Leaf 1 was created as id 2, root was created as id 3
    assert(brokenPath.front() == 2);
    assert(brokenPath.back() == 3);

    std::cout << "[PASS] Test 7: MerkleTree (root of [a,b] == sha256Hex(a+b), proof verification, brokenPath)\n";
}

void testHashChain() {
    HashChain chain;
    chain.append("ADD", "note.txt");
    chain.append("ADD", "log.csv");
    chain.append("ADD", "config.json");

    assert(chain.size() == 3);
    auto v1 = chain.verify();
    assert(v1.valid);
    assert(v1.brokenAt == -1);

    // Tamper block index 1
    chain.editBlockDetails(1, "ATTACKER MODIFIED log.csv DETAILS");
    auto v2 = chain.verify();
    assert(!v2.valid);
    assert(v2.brokenAt == 1);

    std::cout << "[PASS] Test 8: HashChain (append 3 blocks -> valid; edit block 1 -> brokenAt == 1)\n";
}

void testHuffman() {
    // (a) Repeated text
    std::string text = "beep boop beer! abracadabra abracadabra 12345 12345 aaaa bbbb cccc";
    std::vector<uint8_t> dataA(text.begin(), text.end());
    auto encA = Huffman::encode(dataA);
    auto decA = Huffman::decode(encA.bits, encA.tree);
    assert(decA == dataA);
    assert(encA.bits.size() <= dataA.size() * 8);
    Huffman::freeTree(encA.tree);

    // (b) All 256 byte values once
    std::vector<uint8_t> dataB(256);
    std::iota(dataB.begin(), dataB.end(), 0);
    auto encB = Huffman::encode(dataB);
    auto decB = Huffman::decode(encB.bits, encB.tree);
    assert(decB == dataB);
    Huffman::freeTree(encB.tree);

    // (c) Empty input
    std::vector<uint8_t> dataC;
    auto encC = Huffman::encode(dataC);
    auto decC = Huffman::decode(encC.bits, encC.tree);
    assert(decC.empty());
    Huffman::freeTree(encC.tree);

    // (d) Single repeated byte
    std::vector<uint8_t> dataD(50, 0x5A);
    auto encD = Huffman::encode(dataD);
    auto decD = Huffman::decode(encD.bits, encD.tree);
    assert(decD == dataD);
    Huffman::freeTree(encD.tree);

    std::cout << "[PASS] Test 9: Huffman (round-trip lossless on repeated, 256-bytes, empty, single byte)\n";
}

void testVaultCore() {
    VaultCore vault;

    // Enqueue 2 files
    std::vector<uint8_t> f1Bytes = {'H', 'e', 'l', 'l', 'o', ' ', '1'};
    std::vector<uint8_t> f2Bytes = {'W', 'o', 'r', 'l', 'd', ' ', '2'};
    assert(vault.enqueue("f1.txt", f1Bytes));
    assert(vault.enqueue("f2.txt", f2Bytes));

    EvidenceFile p1, p2;
    assert(vault.processNext(p1));
    assert(vault.processNext(p2));
    assert(p1.id == "f1");
    assert(p2.id == "f2");

    // Verify clean
    std::string vClean = vault.verifyIntegrity();
    assert(vClean.find("\"tampered\":[]") != std::string::npos);
    assert(vClean.find("\"chainValid\":true") != std::string::npos);
    assert(vClean.find("\"brokenAt\":-1") != std::string::npos);

    // Simulate tamper on file 2
    assert(vault.simulateTamper("f2"));

    // Verify flags file 2 with non-empty broken path, chain still valid
    std::string vTampered = vault.verifyIntegrity();
    assert(vTampered.find("\"tampered\":[\"f2\"]") != std::string::npos);
    assert(vTampered.find("\"brokenPath\":[") != std::string::npos);
    assert(vTampered.find("\"brokenPath\":[]") == std::string::npos); // path is not empty
    assert(vTampered.find("\"chainValid\":true") != std::string::npos);

    // Malformed protocol line error test
    protocol::Request req;
    std::string parseErr;
    assert(!protocol::parseRequest("{this is not valid json}", req, parseErr));
    std::string errResp = protocol::makeErrorResponse(99, "malformed");
    assert(errResp.find("\"ok\":false") != std::string::npos);

    std::cout << "[PASS] Test 10: VaultCore (enqueue, process 2 files, tamper f2, Merkle detection, bad JSON)\n";
}

int main() {
    std::cout << "========================================\n";
    std::cout << " RUNNING EVIDENCE VAULT CORE SELF-TESTS \n";
    std::cout << "========================================\n";

    testStack();
    testCircularQueue();
    testMinHeap();
    testHashTable();
    testFnv1a();
    testSha256();
    testMerkleTree();
    testHashChain();
    testHuffman();
    testVaultCore();

    std::cout << "========================================\n";
    std::cout << "ALL TESTS PASSED\n";
    std::cout << "========================================\n";
    return 0;
}
