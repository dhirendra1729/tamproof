"use client";

import React from "react";
import { ShieldCheck, AlertOctagon, CheckCircle2, ArrowRight } from "lucide-react";
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
      {/* Run Verification Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#11161f] border border-[#1f2937]">
        <div>
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Full Forensic Verification Pipeline
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Recomputes SHA-256 for all stored files, rebuilds Merkle Tree to pinpoint broken nodes, and re-links the audit chain.
          </p>
        </div>

        <button
          onClick={onVerify}
          disabled={isLoading}
          className={`px-6 py-2.5 rounded-lg font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
            isTampered
              ? "bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-red-950/50"
              : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-950/50"
          } disabled:opacity-50`}
        >
          {isLoading ? (
            <span>Computing Digests in C++...</span>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Run Integrity Check
            </>
          )}
        </button>
      </div>

      {/* Verification Result Banner */}
      {verifyResult && (
        <div
          className={`p-4 rounded-lg border font-mono text-xs transition-all ${
            isTampered
              ? "bg-red-950/80 border-red-500 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.3)] glow-red"
              : "bg-emerald-950/70 border-emerald-500/70 text-emerald-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {isTampered ? (
              <AlertOctagon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}

            <div className="flex-1 space-y-1">
              <div className="font-bold text-sm tracking-wide">
                {isTampered
                  ? "CRITICAL ALERT: FORENSIC INTEGRITY VIOLATION DETECTED"
                  : `ALL ${fileCount} EVIDENCE FILES VERIFIED INTACT`}
              </div>

              {isTampered ? (
                <div className="space-y-1.5 text-xs text-red-300">
                  {verifyResult.tampered.length > 0 && (
                    <div>
                      • Tampered file ID(s):{" "}
                      <span className="font-bold text-white underline">
                        {verifyResult.tampered.join(", ")}
                      </span>
                    </div>
                  )}

                  {verifyResult.brokenPath.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>• Merkle tree broken path:</span>
                      <span className="px-2 py-0.5 rounded bg-red-900/80 border border-red-400 font-bold text-white">
                        {verifyResult.brokenPath.join(" → ")}
                      </span>
                      <span className="text-[10px] text-red-300">
                        (Leaf node #{verifyResult.brokenPath[0]} up to Root #{verifyResult.brokenPath[verifyResult.brokenPath.length - 1]})
                      </span>
                    </div>
                  )}

                  {!verifyResult.chainValid && (
                    <div>
                      • Audit chain broken at Block #{verifyResult.brokenAt}!
                    </div>
                  )}

                  {verifyResult.rootBefore !== verifyResult.rootAfter && (
                    <div className="text-[11px] text-red-300/90 pt-1">
                      Root mismatch: Stored [{verifyResult.rootBefore ? verifyResult.rootBefore.slice(0, 8) : "None"}...] ≠ Recomputed [{verifyResult.rootAfter.slice(0, 8)}...]
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-emerald-300">
                  All SHA-256 digests match recorded commitments. Merkle root verified. Audit hash chain is 100% continuous with zero discrepancies.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
