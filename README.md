# Tamper-Proof Evidence Vault

A digital-forensics evidence vault application that simulates how forensic laboratories prove digital evidence has not been tampered with. Users ingest files into the vault; a native **C++17 engine** hashes each file with hand-written SHA-256, compresses it using Huffman coding, indexes it in a separate-chaining hash table, commits its cryptographic fingerprint into a binary Merkle tree, and records every custody event in a hash-chained audit log. When an attacker secretly flips even a single byte of stored evidence, running an integrity check instantly detects the corruption, identifies the altered file, and illuminates the exact broken path in the Merkle tree from the corrupted leaf node to the root.

<!-- add demo gif -->

---

## 1. Architecture

```text
Browser UI (React)  ──fetch──▶  Next.js API route  ──stdin/stdout──▶  vault_core (C++)
        ▲                            │  JSON lines                     owns ALL state
        └──────────  JSON state snapshot ◀──────────┘                  and ALL logic
```

All data structures and all vault logic run in a C++17 process; the web app is a visualization layer.

The C++ core process (`vault_core`) is the single source of truth. It owns every data structure and every byte of evidence. The web layer never computes hashes, never stores evidence, and never decides anything about integrity — it transmits commands and renders the state snapshot returned by the C++ engine over standard I/O pipes.

---

## 2. Syllabus Mapping (AIT Pune Data Structures, 2025 Pattern)

| Syllabus topic (AIT Pune DS, 2025 pattern) | Where it lives in the app |
|---|---|
| Stack as ADT, operations, applications | `core/include/ds/Stack.h` — undo history of vault actions |
| Queue as ADT, Circular Queue | `core/include/ds/CircularQueue.h` — file ingestion pipeline |
| Priority Queue using heap | `core/include/ds/MinHeap.h` — Huffman tree construction + urgent-verify queue |
| Binary tree, traversals (recursive + iterative) | `core/include/ds/MerkleTree.h`, `core/include/ds/Huffman.h` — both are binary trees; iterative inorder included |
| Hash functions, properties of a good hash | `core/include/ds/fnv1a.h` + `core/include/ds/sha256.h` (both hand-written) |
| Hash tables, collision, chaining, load factor, rehashing | `core/include/ds/HashTable.h` — separate chaining, rehash at load factor 0.75 |
| Case study: File checksums / MD5 | The whole integrity-check flow (SHA-256 fingerprints) |
| Case study: Huffman coding with binary tree | `core/include/ds/Huffman.h` — real compression with ratio shown in UI |

---

## 3. Data Structure Complexity Analysis

| Data Structure | Operation | Average Case | Worst Case | Space Complexity |
|---|---|---|---|---|
| **Stack** (Linked Nodes) | `push`, `pop`, `peek` | $O(1)$ | $O(1)$ | $O(N)$ |
| **CircularQueue** (Array) | `enqueue`, `dequeue`, `front` | $O(1)$ | $O(1)$ | $O(\text{Capacity})$ |
| **MinHeap** (Dynamic Array) | `insert`, `extractMin` | $O(\log N)$ | $O(\log N)$ | $O(N)$ |
| **MinHeap** | `peek` | $O(1)$ | $O(1)$ | $O(1)$ |
| **FNV-1a Hash** | `fnv1a(string)` | $O(L)$ | $O(L)$ | $O(1)$ |
| **SHA-256 Hash** | `sha256Hex(data)` | $O(M)$ | $O(M)$ | $O(1)$ |
| **HashTable** (Separate Chaining) | `set`, `get`, `erase`, `has` | $O(1)$ | $O(N)$ | $O(N + B)$ |
| **HashTable** | `rehash` (doubling) | $O(N)$ | $O(N)$ | $O(N)$ |
| **MerkleTree** (Binary Tree) | `build` | $O(N)$ | $O(N)$ | $O(N)$ |
| **MerkleTree** | `getProof`, `verifyProof` | $O(\log N)$ | $O(\log N)$ | $O(\log N)$ |
| **MerkleTree** | `findBrokenPath` | $O(N)$ | $O(N)$ | $O(\log N)$ |
| **HashChain** (Linked Blocks) | `append` | $O(1)$ | $O(1)$ | $O(N)$ |
| **HashChain** | `verify` | $O(N)$ | $O(N)$ | $O(1)$ |
| **Huffman** | `buildTree`, `encode` | $O(K \log K + N)$ | $O(K \log K + N)$ | $O(K)$ ($K \le 256$) |
| **Huffman** | `decode` | $O(\text{bits})$ | $O(\text{bits})$ | $O(N)$ |

---

## 4. Setup & Installation

### Prerequisites (Arch Linux)
Ensure the required build tools are installed:
```bash
sudo pacman -S --needed base-devel cmake nodejs npm
```

### Installation Steps
```bash
# 1. Install Node.js frontend dependencies
npm install

# 2. Build the C++17 core engine
npm run build:core

# 3. Run the C++ core self-test suite (Build Gate 2)
npm run selftest

# 4. Run the protocol smoke test over stdin/stdout (Build Gate 3)
npm run smoke

# 5. Start the web application
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 5. How the Demo Works

1. **Ingest Evidence**: Click **"Load Sample Evidence"** (or drag and drop files). Each file is enqueued into the `CircularQueue`, then dequeued every 600 ms, hashed with SHA-256, compressed with Huffman coding, indexed in the `HashTable`, inserted into the `MerkleTree`, and appended to the `HashChain`. Rows in the table turn green with a "SECURED" checkmark.
2. **Verify (Clean)**: Click **"Run Integrity Check"**. The banner turns green: *"All N evidence files verified intact. Chain intact. Merkle root unchanged."*
3. **Tamper a File + Catch**: In **Attacker Mode (simulation)**, select a file and click **"Flip 1 Byte (Silent Mutation)"**. In C++ memory, a single byte is flipped (`bytes[i] ^= 0xFF`). The file silently remains marked "secured". Now click **"Run Integrity Check"**: the banner turns red, the file turns red ("TAMPERED"), the audit chain logs a `"VERIFY FAILED"` block, and the exact path from leaf to root illuminates in glowing red in the Merkle tree!
4. **Tamper the Audit Chain**: In **Attacker Mode**, select a historical block and click **"Corrupt Audit Block"**. Click **"Run Integrity Check"**: the audit chain timeline highlights the broken link at that exact block index.
5. **Undo**: Click **"Undo"** in the top navigation bar. The LIFO `Stack` pops the last action, reverses the vault mutation, rebuilds the Merkle tree, and logs an `"UNDO"` block to the audit ledger.
6. **Huffman Inspection**: Click any row in the evidence table to view its Huffman compression statistics, byte frequencies, and prefix code table.
7. **Reset**: Click **"Reset Vault"** to clear all data structures back to a pristine state for a fresh demonstration run.

---

## 6. What is Real vs. Simulated

- **Real**:
  - Hand-written C++17 Data Structures: `Stack`, `CircularQueue`, `MinHeap`, `HashTable`, `MerkleTree`, `HashChain`, `Huffman`.
  - Hand-written cryptographic SHA-256 implementation matching NIST FIPS PUB 180-4 (zero external libraries, no OpenSSL).
  - Hand-written non-cryptographic 32-bit FNV-1a hash function.
  - Real lossless Huffman coding (round-tripped and verified).
  - Real line-buffered stdio JSON IPC protocol connecting Node.js and C++.
- **Simulated**:
  - Adversary attacks: The "Attacker Mode" panel deliberately mutates in-memory C++ buffers and block fields to simulate physical tampering and disk corruption.
  - Storage: Evidence and audit chains are stored in C++ process memory for the demonstration rather than distributed disk or persistent blockchain networks.
