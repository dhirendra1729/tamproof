#pragma once

#include <cstddef>
#include <cstdint>
#include <string>
#include <vector>

namespace base64 {

inline const char* charset() {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
}

inline std::string encode(const uint8_t* data, size_t len) {
    const char* chars = charset();
    std::string out;
    out.reserve(((len + 2) / 3) * 4);

    size_t i = 0;
    while (i < len) {
        size_t rem = len - i;
        uint32_t octet_a = data[i++];
        uint32_t octet_b = (rem > 1) ? data[i++] : 0;
        uint32_t octet_c = (rem > 2) ? data[i++] : 0;

        uint32_t triple = (octet_a << 16) | (octet_b << 8) | octet_c;

        out.push_back(chars[(triple >> 18) & 0x3F]);
        out.push_back(chars[(triple >> 12) & 0x3F]);
        out.push_back((rem > 1) ? chars[(triple >> 6) & 0x3F] : '=');
        out.push_back((rem > 2) ? chars[triple & 0x3F] : '=');
    }

    return out;
}

inline std::string encode(const std::vector<uint8_t>& data) {
    return encode(data.data(), data.size());
}

inline std::string encode(const std::string& str) {
    return encode(reinterpret_cast<const uint8_t*>(str.data()), str.size());
}

inline std::vector<uint8_t> decode(const std::string& in) {
    std::vector<uint8_t> out;
    out.reserve((in.size() * 3) / 4);

    int val = 0, valb = -8;
    for (unsigned char c : in) {
        int d = -1;
        if (c >= 'A' && c <= 'Z') d = c - 'A';
        else if (c >= 'a' && c <= 'z') d = c - 'a' + 26;
        else if (c >= '0' && c <= '9') d = c - '0' + 52;
        else if (c == '+') d = 62;
        else if (c == '/') d = 63;
        else if (c == '=') break; // padding
        else continue; // ignore whitespace/newlines

        val = (val << 6) | d;
        valb += 6;
        if (valb >= 0) {
            out.push_back(static_cast<uint8_t>((val >> valb) & 0xFF));
            valb -= 8;
        }
    }
    return out;
}

} // namespace base64
