#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CORE_BIN="$ROOT_DIR/core/build/vault_core"

if [[ ! -x "$CORE_BIN" ]]; then
    echo "Error: vault_core binary not found at $CORE_BIN"
    exit 1
fi

echo "========================================"
echo " RUNNING VAULT CORE PROTOCOL SMOKE TEST "
echo "========================================"

INPUT_DATA=$(cat << 'EOF'
{"id":1,"cmd":"ping"}
{"id":2,"cmd":"enqueue","name":"test1.txt","data_b64":"SGVsbG8gV29ybGQ="}
{"id":3,"cmd":"enqueue","name":"test2.txt","data_b64":"U2Vjb25kIGZpbGU="}
{"id":4,"cmd":"process_next"}
{"id":5,"cmd":"process_next"}
{"id":6,"cmd":"verify"}
{"id":7,"cmd":"tamper_file","file":"f2"}
{"id":8,"cmd":"verify"}
{"id":9,"cmd":"state"}
EOF
)

OUTPUT=$(echo "$INPUT_DATA" | "$CORE_BIN")

echo "Received responses from vault_core:"
echo "$OUTPUT"
echo "----------------------------------------"

# 1. Check ping response
RESP1=$(echo "$OUTPUT" | grep '^{"id":1,')
if ! echo "$RESP1" | grep -q '"pong":true'; then
    echo "FAIL: ping response missing or invalid"
    exit 1
fi
echo "[OK] Step 1: ping verified"

# 2 & 3. Check enqueue
RESP2=$(echo "$OUTPUT" | grep '^{"id":2,')
RESP3=$(echo "$OUTPUT" | grep '^{"id":3,')
if ! echo "$RESP2" | grep -q '"enqueued":true.*"name":"test1.txt"'; then
    echo "FAIL: enqueue test1.txt failed"
    exit 1
fi
if ! echo "$RESP3" | grep -q '"enqueued":true.*"name":"test2.txt"'; then
    echo "FAIL: enqueue test2.txt failed"
    exit 1
fi
echo "[OK] Step 2 & 3: enqueue test1.txt and test2.txt verified"

# 4 & 5. Check process_next
RESP4=$(echo "$OUTPUT" | grep '^{"id":4,')
RESP5=$(echo "$OUTPUT" | grep '^{"id":5,')
if ! echo "$RESP4" | grep -q '"processed":true.*"id":"f1"'; then
    echo "FAIL: process_next f1 failed"
    exit 1
fi
if ! echo "$RESP5" | grep -q '"processed":true.*"id":"f2"'; then
    echo "FAIL: process_next f2 failed"
    exit 1
fi
echo "[OK] Step 4 & 5: process_next f1 and f2 verified"

# 6. Check clean verify
RESP6=$(echo "$OUTPUT" | grep '^{"id":6,')
if ! echo "$RESP6" | grep -q '"tampered":\[\]' || ! echo "$RESP6" | grep -q '"chainValid":true'; then
    echo "FAIL: clean verify failed"
    exit 1
fi
echo "[OK] Step 6: clean verify passed (tampered:[], chainValid:true)"

# 7. Check tamper_file
RESP7=$(echo "$OUTPUT" | grep '^{"id":7,')
if ! echo "$RESP7" | grep -q '"tampered":true.*"file":"f2"'; then
    echo "FAIL: tamper_file response missing"
    exit 1
fi
echo "[OK] Step 7: tamper_file f2 verified"

# 8. Check tampered verify (catches f2 and non-empty broken path)
RESP8=$(echo "$OUTPUT" | grep '^{"id":8,')
if ! echo "$RESP8" | grep -q '"tampered":\["f2"\]'; then
    echo "FAIL: tampered verify did not catch f2"
    exit 1
fi
if echo "$RESP8" | grep -q '"brokenPath":\[\]'; then
    echo "FAIL: brokenPath was empty after tamper"
    exit 1
fi
echo "[OK] Step 8: tampered verify caught f2 with non-empty brokenPath"

# 9. Check state
RESP9=$(echo "$OUTPUT" | grep '^{"id":9,')
if ! echo "$RESP9" | grep -q '"files":\['; then
    echo "FAIL: state response missing or invalid"
    exit 1
fi
echo "[OK] Step 9: state snapshot verified"

echo "========================================"
echo "SMOKE OK"
echo "========================================"
