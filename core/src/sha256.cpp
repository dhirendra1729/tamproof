#include "ds/sha256.h"

#include <cstring>
#include <iomanip>
#include <sstream>
#include <vector>

namespace {

inline uint32_t rotr(uint32_t x, uint32_t n) {
    return (x >> n) | (x << (32 - n));
}

inline uint32_t ch(uint32_t x, uint32_t y, uint32_t z) {
    return (x & y) ^ (~x & z);
}

inline uint32_t maj(uint32_t x, uint32_t y, uint32_t z) {
    return (x & y) ^ (x & z) ^ (y & z);
}

inline uint32_t bigSigma0(uint32_t x) {
    return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
}

inline uint32_t bigSigma1(uint32_t x) {
    return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
}

inline uint32_t smallSigma0(uint32_t x) {
    return rotr(x, 7) ^ rotr(x, 18) ^ (x >> 3);
}

inline uint32_t smallSigma1(uint32_t x) {
    return rotr(x, 17) ^ rotr(x, 19) ^ (x >> 10);
}

const uint32_t K[64] = {
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
};

} // namespace

std::string sha256Hex(const uint8_t* data, size_t len) {
    // Initial hash values
    uint32_t H0 = 0x6a09e667;
    uint32_t H1 = 0xbb67ae85;
    uint32_t H2 = 0x3c6ef372;
    uint32_t H3 = 0xa54ff53a;
    uint32_t H4 = 0x510e527f;
    uint32_t H5 = 0x9b05688c;
    uint32_t H6 = 0x1f83d9ab;
    uint32_t H7 = 0x5be0cd19;

    // Pre-processing: padding
    uint64_t totalBits = static_cast<uint64_t>(len) * 8;
    size_t remainder = len % 64;
    size_t padLen = (remainder < 56) ? (56 - remainder) : (120 - remainder);
    size_t totalLen = len + padLen + 8;

    std::vector<uint8_t> buffer(totalLen, 0);
    if (len > 0 && data != nullptr) {
        std::memcpy(buffer.data(), data, len);
    }
    buffer[len] = 0x80;

    // Append 64-bit big-endian length
    for (int i = 0; i < 8; ++i) {
        buffer[totalLen - 1 - i] = static_cast<uint8_t>((totalBits >> (i * 8)) & 0xFF);
    }

    // Process each 512-bit (64-byte) chunk
    for (size_t chunkStart = 0; chunkStart < totalLen; chunkStart += 64) {
        uint32_t W[64];
        for (int t = 0; t < 16; ++t) {
            size_t idx = chunkStart + t * 4;
            W[t] = (static_cast<uint32_t>(buffer[idx]) << 24) |
                   (static_cast<uint32_t>(buffer[idx + 1]) << 16) |
                   (static_cast<uint32_t>(buffer[idx + 2]) << 8) |
                   (static_cast<uint32_t>(buffer[idx + 3]));
        }
        for (int t = 16; t < 64; ++t) {
            W[t] = smallSigma1(W[t - 2]) + W[t - 7] + smallSigma0(W[t - 15]) + W[t - 16];
        }

        uint32_t a = H0;
        uint32_t b = H1;
        uint32_t c = H2;
        uint32_t d = H3;
        uint32_t e = H4;
        uint32_t f = H5;
        uint32_t g = H6;
        uint32_t h = H7;

        for (int t = 0; t < 64; ++t) {
            uint32_t T1 = h + bigSigma1(e) + ch(e, f, g) + K[t] + W[t];
            uint32_t T2 = bigSigma0(a) + maj(a, b, c);
            h = g;
            g = f;
            f = e;
            e = d + T1;
            d = c;
            c = b;
            b = a;
            a = T1 + T2;
        }

        H0 += a;
        H1 += b;
        H2 += c;
        H3 += d;
        H4 += e;
        H5 += f;
        H6 += g;
        H7 += h;
    }

    std::ostringstream oss;
    oss << std::hex << std::setfill('0');
    uint32_t H[8] = {H0, H1, H2, H3, H4, H5, H6, H7};
    for (int i = 0; i < 8; ++i) {
        oss << std::setw(8) << H[i];
    }
    return oss.str();
}

std::string sha256Hex(const std::string& s) {
    return sha256Hex(reinterpret_cast<const uint8_t*>(s.data()), s.size());
}
