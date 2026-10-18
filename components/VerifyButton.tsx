"use client";

import React from "react";
import { VerifyResult } from "@/lib/types";

interface VerifyButtonProps {
  onVerify: () => void;
  isLoading: boolean;
  verifyResult: VerifyResult | null;
  fileCount: number;
}

export function VerifyButton({
  onVerify,
  isLoading,
  verifyResult,
  fileCount,
}: VerifyButtonProps) {
  const isTampered =
    Boolean(verifyResult &&
    (verifyResult.tampered.length > 0 ||
      verifyResult.brokenPath.length > 0 ||
      !verifyResult.chainValid ||
      (verifyResult.rootBefore !== verifyResult.rootAfter && fileCount > 0)));

  return (
    <div className="space-y-4">
      {/* Run Verification Command Card */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-6 rounded-xl bg-white border-2 border-[#4A6150] shadow-cardFrame">
        <div>
          <h3 className="text-base font-bold font-mono text-[#223326] uppercase tracking-wider">
            Cryptographic Integrity Audit
          </h3>
          <p className="text-xs text-[#5A6B5E] font-sans mt-0.5 font-medium">
            Recalculates SHA-256 digests across all stored buffers, rebuilds the Merkle tree to trace broken paths, and checks audit chain links.
          </p>
        </div>

        <button
          onClick={onVerify}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg border-2 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${
            isTampered
              ? "bg-[#D9383A] hover:bg-[#B91C1C] border-[#D9383A] text-white animate-pulse"
              : "bg-[#223326] hover:bg-[#5A7D5C] border-[#223326] hover:border-[#5A7D5C] text-white"
          } disabled:opacity-50`}
        >
          {isLoading ? "Running C++ Verification..." : "Run Integrity Check"}
        </button>
      </div>

      {/* Verification Result Card */}
      {verifyResult && (
        <div
          className={`p-5 rounded-xl border-2 font-mono text-xs transition-all shadow-cardFrame ${
            isTampered
              ? "bg-[#FDF2F2] border-[#D9383A] text-[#223326] glow-red"
              : "bg-[#EBF3EE] border-2 border-[#5A7D5C] text-[#223326]"
          }`}
        >
          <div className="space-y-2">
            <div
              className={`font-black text-sm tracking-wide ${
                isTampered ? "text-[#D9383A]" : "text-[#5A7D5C]"
              }`}
            >
              {isTampered
                ? "CRITICAL VIOLATION: DATA TAMPERING DETECTED"
                : `ALL ${fileCount} EVIDENCE FILES VERIFIED INTACT`}
            </div>

            {isTampered ? (
              <div className="space-y-1.5 text-xs text-[#223326]">
                {verifyResult.tampered.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#5A6B5E] font-semibold">Corrupted File ID(s):</span>
                    <span className="px-2 py-0.5 rounded bg-[#FEE2E2] border border-[#FCA5A5] font-bold text-[#D9383A]">
                      {verifyResult.tampered.join(", ")}
                    </span>
                  </div>
                )}

                {verifyResult.brokenPath.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#5A6B5E] font-semibold">Broken Merkle Path:</span>
                    <span className="px-2.5 py-0.5 rounded bg-[#D9383A] font-bold text-white">
                      {verifyResult.brokenPath.join(" → ")}
                    </span>
                    <span className="text-[11px] text-[#5A6B5E]">
                      (Leaf #{verifyResult.brokenPath[0]} up to Root #{verifyResult.brokenPath[verifyResult.brokenPath.length - 1]})
                    </span>
                  </div>
                )}

                {!verifyResult.chainValid && (
                  <div className="text-[#D9383A] font-bold">
                    Audit log chain link broken at Block #{verifyResult.brokenAt}
                  </div>
                )}

                {verifyResult.rootBefore !== verifyResult.rootAfter && (
                  <div className="text-[11px] text-[#5A6B5E] pt-0.5">
                    Root Mismatch: Stored [{verifyResult.rootBefore ? verifyResult.rootBefore.slice(0, 8) : "None"}...] ≠ Computed [{verifyResult.rootAfter.slice(0, 8)}...]
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-[#5A6B5E] font-medium font-sans">
                All SHA-256 fingerprints match recorded commitments. Merkle root verified. Audit hash chain is 100% continuous.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
