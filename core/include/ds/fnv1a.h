#pragma once

#include <cstdint>
#include <string>

/**
 * @file fnv1a.h
 * @brief Hand-written 32-bit Fowler-Noll-Vo (FNV-1a) non-cryptographic hash function.
 *
 * Properties of a Good Hash Function (Syllabus Point):
 * 1. Determinism: Identical string inputs always produce identical 32-bit hash digests.
 * 2. Uniform Distribution: Hashes are distributed evenly across the 2^32 space to minimize
 *    bucket clustering and hash collisions in hash tables.
 * 3. High Avalanche Effect: Changing a single input character or bit causes significant,
 *    unpredictable dispersion across the output bits due to the XOR followed by multiplication
 *    with the FNV prime (16777619).
 * 4. Computational Efficiency: Processes byte-by-byte in O(L) time where L is string length,
 *    with negligible memory overhead and zero dynamic allocations.
 *
 * Note: FNV-1a is non-cryptographic and intentionally chosen for fast hash table lookups,
 * whereas SHA-256 is used for cryptographic evidence fingerprinting.
 *
 * App Use:
 * Hash table bucket indexing for evidence file names.
 */

inline uint32_t fnv1a(const std::string& s) {
    constexpr uint32_t FNV_OFFSET_BASIS = 2166136261u;
    constexpr uint32_t FNV_PRIME = 16777619u;

    uint32_t hash = FNV_OFFSET_BASIS;
    for (unsigned char c : s) {
        hash ^= static_cast<uint32_t>(c);
        hash *= FNV_PRIME;
    }
    return hash;
}
