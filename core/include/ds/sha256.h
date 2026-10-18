#pragma once

#include <cstddef>
#include <cstdint>
#include <string>

/**
 * @file sha256.h
 * @brief Hand-written Secure Hash Algorithm (SHA-256) per NIST FIPS PUB 180-4.
 *
 * Notice: SHA-256 is a cryptographic hash primitive, NOT a data structure.
 * It is implemented from scratch here without any third-party libraries (no OpenSSL)
 * to keep the core engine 100% self-contained and dependency-free.
 *
 * Citation: National Institute of Standards and Technology (NIST),
 * "Secure Hash Standard (SHS)", Federal Information Processing Standards
 * Publication (FIPS PUB) 180-4, August 2015.
 *
 * Properties:
 * - One-way pre-image resistance
 * - Second pre-image resistance
 * - Collision resistance (256-bit output)
 *
 * App Use:
 * Cryptographic fingerprinting of evidence files, Merkle tree node hashing,
 * and block linking in the audit hash chain.
 */

std::string sha256Hex(const uint8_t* data, size_t len);
std::string sha256Hex(const std::string& s);
