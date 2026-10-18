#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace protocol {

struct Request {
    int id = 0;
    std::string cmd;
    std::string name;
    std::string data_b64;
    std::string file;
    std::string details;
    int64_t index = -1;

    bool hasId = false;
    bool hasCmd = false;
    bool hasName = false;
    bool hasDataB64 = false;
    bool hasFile = false;
    bool hasDetails = false;
    bool hasIndex = false;
};

bool parseRequest(const std::string& line, Request& req, std::string& errorMsg);

std::string escapeJson(const std::string& s);

std::string makeOkResponse(int id, const std::string& resultJson);
std::string makeErrorResponse(int id, const std::string& errorMsg);

} // namespace protocol
