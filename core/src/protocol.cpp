#include "protocol.h"

#include <cctype>
#include <sstream>

namespace protocol {

static void skipWhitespace(const std::string& s, size_t& i) {
    while (i < s.size() && (std::isspace(static_cast<unsigned char>(s[i])) || s[i] == '\r' || s[i] == '\n')) {
        ++i;
    }
}

static bool parseString(const std::string& s, size_t& i, std::string& out) {
    skipWhitespace(s, i);
    if (i >= s.size() || s[i] != '"') {
        return false;
    }
    ++i; // skip open quote
    out.clear();
    while (i < s.size()) {
        char c = s[i++];
        if (c == '"') {
            return true;
        }
        if (c == '\\') {
            if (i >= s.size()) return false;
            char esc = s[i++];
            if (esc == '"') out.push_back('"');
            else if (esc == '\\') out.push_back('\\');
            else if (esc == '/') out.push_back('/');
            else if (esc == 'b') out.push_back('\b');
            else if (esc == 'f') out.push_back('\f');
            else if (esc == 'n') out.push_back('\n');
            else if (esc == 'r') out.push_back('\r');
            else if (esc == 't') out.push_back('\t');
            else out.push_back(esc);
        } else {
            out.push_back(c);
        }
    }
    return false; // unclosed quote
}

static bool parseNumber(const std::string& s, size_t& i, int64_t& out) {
    skipWhitespace(s, i);
    if (i >= s.size()) return false;
    size_t start = i;
    if (s[i] == '-') ++i;
    if (i >= s.size() || !std::isdigit(static_cast<unsigned char>(s[i]))) return false;
    while (i < s.size() && std::isdigit(static_cast<unsigned char>(s[i]))) {
        ++i;
    }
    try {
        out = std::stoll(s.substr(start, i - start));
        return true;
    } catch (...) {
        return false;
    }
}

bool parseRequest(const std::string& line, Request& req, std::string& errorMsg) {
    req = Request{};
    size_t i = 0;
    skipWhitespace(line, i);
    if (i >= line.size() || line[i] != '{') {
        errorMsg = "expected '{' at start of JSON object";
        return false;
    }
    ++i; // skip '{'

    while (i < line.size()) {
        skipWhitespace(line, i);
        if (i < line.size() && line[i] == '}') {
            ++i;
            skipWhitespace(line, i);
            return true;
        }

        std::string key;
        if (!parseString(line, i, key)) {
            errorMsg = "failed to parse key in JSON object";
            return false;
        }

        skipWhitespace(line, i);
        if (i >= line.size() || line[i] != ':') {
            errorMsg = "expected ':' after key '" + key + "'";
            return false;
        }
        ++i; // skip ':'
        skipWhitespace(line, i);

        if (i < line.size() && line[i] == '"') {
            std::string strVal;
            if (!parseString(line, i, strVal)) {
                errorMsg = "failed to parse string value for key '" + key + "'";
                return false;
            }
            if (key == "cmd") {
                req.cmd = strVal;
                req.hasCmd = true;
            } else if (key == "name") {
                req.name = strVal;
                req.hasName = true;
            } else if (key == "data_b64") {
                req.data_b64 = strVal;
                req.hasDataB64 = true;
            } else if (key == "file") {
                req.file = strVal;
                req.hasFile = true;
            } else if (key == "details") {
                req.details = strVal;
                req.hasDetails = true;
            }
        } else if (i < line.size() && (std::isdigit(static_cast<unsigned char>(line[i])) || line[i] == '-')) {
            int64_t numVal = 0;
            if (!parseNumber(line, i, numVal)) {
                errorMsg = "failed to parse number value for key '" + key + "'";
                return false;
            }
            if (key == "id") {
                req.id = static_cast<int>(numVal);
                req.hasId = true;
            } else if (key == "index") {
                req.index = numVal;
                req.hasIndex = true;
            }
        } else {
            // Unknown or unsupported primitive (skip till comma or brace)
            while (i < line.size() && line[i] != ',' && line[i] != '}') {
                ++i;
            }
        }

        skipWhitespace(line, i);
        if (i < line.size() && line[i] == ',') {
            ++i; // skip comma
        } else if (i < line.size() && line[i] == '}') {
            ++i;
            skipWhitespace(line, i);
            return true;
        } else {
            errorMsg = "expected ',' or '}'";
            return false;
        }
    }

    errorMsg = "unexpected end of JSON string";
    return false;
}

std::string escapeJson(const std::string& s) {
    std::string out;
    out.reserve(s.size() + 8);
    for (char c : s) {
        switch (c) {
            case '"': out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\b': out += "\\b"; break;
            case '\f': out += "\\f"; break;
            case '\n': out += "\\n"; break;
            case '\r': out += "\\r"; break;
            case '\t': out += "\\t"; break;
            default:
                if (static_cast<unsigned char>(c) < 0x20) {
                    char buf[8];
                    snprintf(buf, sizeof(buf), "\\u%04x", static_cast<unsigned char>(c));
                    out += buf;
                } else {
                    out.push_back(c);
                }
                break;
        }
    }
    return out;
}

std::string makeOkResponse(int id, const std::string& resultJson) {
    std::string out = "{\"id\":";
    out += std::to_string(id);
    out += ",\"ok\":true,\"result\":";
    out += resultJson;
    out += "}";
    return out;
}

std::string makeErrorResponse(int id, const std::string& errorMsg) {
    std::string out = "{\"id\":";
    out += std::to_string(id);
    out += ",\"ok\":false,\"error\":\"";
    out += escapeJson(errorMsg);
    out += "\"}";
    return out;
}

} // namespace protocol
