#include "VaultCore.h"
#include "base64.h"
#include "protocol.h"

#include <iostream>
#include <string>

int main() {
    // Fast I/O and line buffering
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(nullptr);

    VaultCore vault;
    std::string line;

    while (std::getline(std::cin, line)) {
        if (line.empty()) {
            continue;
        }

        protocol::Request req;
        std::string parseErr;
        if (!protocol::parseRequest(line, req, parseErr)) {
            std::cout << protocol::makeErrorResponse(req.id, "Malformed JSON request: " + parseErr) << "\n";
            std::cout.flush();
            continue;
        }

        if (req.cmd == "ping") {
            std::cout << protocol::makeOkResponse(req.id, "{\"pong\":true,\"status\":\"ready\"}") << "\n";
        } else if (req.cmd == "enqueue") {
            if (!req.hasName || !req.hasDataB64) {
                std::cout << protocol::makeErrorResponse(req.id, "Missing 'name' or 'data_b64' for enqueue") << "\n";
            } else {
                std::vector<uint8_t> bytes = base64::decode(req.data_b64);
                bool ok = vault.enqueue(req.name, bytes);
                if (ok) {
                    std::string res = "{\"enqueued\":true,\"name\":\"" + protocol::escapeJson(req.name) + "\"}";
                    std::cout << protocol::makeOkResponse(req.id, res) << "\n";
                } else {
                    std::cout << protocol::makeErrorResponse(req.id, "Ingestion queue is full (capacity 64)") << "\n";
                }
            }
        } else if (req.cmd == "process_next") {
            EvidenceFile processed;
            bool ok = vault.processNext(processed);
            if (ok) {
                std::string res = "{\"processed\":true,\"id\":\"" + protocol::escapeJson(processed.id) +
                                  "\",\"name\":\"" + protocol::escapeJson(processed.name) +
                                  "\",\"storedHash\":\"" + protocol::escapeJson(processed.storedHash) + "\"}";
                std::cout << protocol::makeOkResponse(req.id, res) << "\n";
            } else {
                std::string res = "{\"processed\":false,\"message\":\"queue empty\"}";
                std::cout << protocol::makeOkResponse(req.id, res) << "\n";
            }
        } else if (req.cmd == "verify") {
            std::string verifyResult = vault.verifyIntegrity();
            std::cout << protocol::makeOkResponse(req.id, verifyResult) << "\n";
        } else if (req.cmd == "tamper_file") {
            if (!req.hasFile) {
                std::cout << protocol::makeErrorResponse(req.id, "Missing 'file' id for tamper_file") << "\n";
            } else {
                bool ok = vault.simulateTamper(req.file);
                if (ok) {
                    std::string res = "{\"tampered\":true,\"file\":\"" + protocol::escapeJson(req.file) + "\"}";
                    std::cout << protocol::makeOkResponse(req.id, res) << "\n";
                } else {
                    std::cout << protocol::makeErrorResponse(req.id, "File ID not found: " + req.file) << "\n";
                }
            }
        } else if (req.cmd == "tamper_block") {
            if (!req.hasIndex || !req.hasDetails) {
                std::cout << protocol::makeErrorResponse(req.id, "Missing 'index' or 'details' for tamper_block") << "\n";
            } else {
                vault.tamperChainBlock(static_cast<size_t>(req.index), req.details);
                std::string res = "{\"tampered\":true,\"index\":" + std::to_string(req.index) + "}";
                std::cout << protocol::makeOkResponse(req.id, res) << "\n";
            }
        } else if (req.cmd == "undo") {
            bool ok = vault.undo();
            if (ok) {
                std::cout << protocol::makeOkResponse(req.id, "{\"undone\":true}") << "\n";
            } else {
                std::cout << protocol::makeOkResponse(req.id, "{\"undone\":false,\"message\":\"stack empty\"}") << "\n";
            }
        } else if (req.cmd == "flag_urgent") {
            if (!req.hasFile) {
                std::cout << protocol::makeErrorResponse(req.id, "Missing 'file' id for flag_urgent") << "\n";
            } else {
                vault.flagUrgent(req.file);
                std::string res = "{\"flagged\":true,\"file\":\"" + protocol::escapeJson(req.file) + "\"}";
                std::cout << protocol::makeOkResponse(req.id, res) << "\n";
            }
        } else if (req.cmd == "process_urgent") {
            std::string urgentRes;
            bool ok = vault.processUrgent(urgentRes);
            if (ok) {
                std::cout << protocol::makeOkResponse(req.id, urgentRes) << "\n";
            } else {
                std::cout << protocol::makeOkResponse(req.id, "{\"processed\":false,\"message\":\"urgent heap empty\"}") << "\n";
            }
        } else if (req.cmd == "state") {
            std::string state = vault.stateJson();
            std::cout << protocol::makeOkResponse(req.id, state) << "\n";
        } else if (req.cmd == "reset") {
            vault.reset();
            std::cout << protocol::makeOkResponse(req.id, "{\"reset\":true}") << "\n";
        } else {
            std::cout << protocol::makeErrorResponse(req.id, "unknown command: " + req.cmd) << "\n";
        }

        std::cout.flush();
    }

    return 0;
}
