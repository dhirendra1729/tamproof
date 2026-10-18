# Viva Voce Examination Questions & Answers

Short, crisp answers designed for viva voce presentation. Speak them clearly and with confidence.

---

### 1. Why C++ for the core and a web page for the demo?
**Answer:** The course objective is to implement fundamental data structures from scratch with manual memory management, and C++ is where that implementation is graded without relying on libraries. The browser is only a visual projector: every hash, tree, queue, heap, and table lives inside the long-running C++ process, and the web page merely renders the state snapshot the C++ core sends back over standard I/O.

---

### 2. Why a Merkle tree instead of hashing each file separately?
**Answer:** Individual file hashes tell you a file changed only if you maintain a separate trusted record of every single hash and verify each one individually in $O(N)$ comparisons. The Merkle tree aggregates all evidence into a single 32-byte Merkle root. It allows verifying any file in $O(\log N)$ time using an inclusion proof, and when tampering occurs, the broken path through the tree immediately pinpoints the exact file and corrupted branch.

---

### 3. Why chaining and not open addressing in the hash table?
**Answer:** Separate chaining handles hash collisions gracefully without primary or secondary clustering, which often degrades open addressing performance. Deletion is also simple ($O(1)$ node unlinking) without needing special "tombstone" markers. To prevent long chains, our table automatically doubles in capacity and rehashes whenever the load factor exceeds 0.75.

---

### 4. Why is the priority queue a heap and not a sorted array?
**Answer:** In a binary min-heap, both insertion and extracting the minimum element take $O(\log N)$ time. In contrast, a sorted array requires $O(N)$ time per insertion due to shifting elements. Because Huffman tree construction performs approximately $2N$ priority queue operations, a heap is asymptotically and practically faster.

---

### 5. Why a circular queue for ingestion?
**Answer:** A circular queue uses a fixed-size contiguous memory buffer and provides $O(1)$ enqueue and dequeue operations without shifting elements. Modulo arithmetic wraps head and tail pointers seamlessly around the buffer boundary, guaranteeing strict First-In-First-Out (FIFO) arrival order for incoming evidence files.

---

### 6. Where is the stack?
**Answer:** The stack powers the vault's undo history. Since the most recent action is always the first one that must be reversed, a Last-In-First-Out (LIFO) linked-node stack is the natural data structure. Every ingestion or replacement pushes an action record; clicking "Undo" pops and reverses it.

---

### 7. Why SHA-256 for fingerprints but FNV-1a for the hash table?
**Answer:** Evidence fingerprints require cryptographic collision resistance, pre-image resistance, and protection against deliberate adversarial attacks, which SHA-256 provides. Hash table keys, however, only require fast, uniform distribution across bucket arrays without cryptographic overhead. FNV-1a operates with high speed and strong avalanche distribution in just a few CPU instructions. Both are implemented completely from scratch.

---

### 8. What breaks if the attacker edits the audit log?
**Answer:** Every block in the audit chain stores the cryptographic SHA-256 hash of the previous block (`prevHash`). If an attacker alters the details of block $k$, block $k$'s recomputed hash changes, which immediately causes a mismatch with the `prevHash` recorded in block $k+1$. A single linear pass through the chain detects the first broken link.

---

### 9. Is this a blockchain?
**Answer:** No. While it borrows the concept of hash-linked blocks for tamper evidence, there is no peer-to-peer network, no distributed consensus protocol (like Proof-of-Work or Proof-of-Stake), and no mining. It is an immutable, append-only cryptographic hash chain managed inside a single C++ forensics engine.
