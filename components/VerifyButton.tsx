"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, GitFork, AlertOctagon, Link2Off } from "lucide-react";
import { VerifyResult } from "@/lib/types";

interface VerifyButtonProps {
  verifyResult: VerifyResult | null;
  fileCount: number;
}

export function VerifyButton({
  verifyResult,
  fileCount,
}: VerifyButtonProps) {
  if (!verifyResult) return null;

  const isTampered =
    Boolean(verifyResult.tampered.length > 0 ||
    verifyResult.brokenPath.length > 0 ||
    !verifyResult.chainValid ||
    (verifyResult.rootBefore !== verifyResult.rootAfter && fileCount > 0));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        className={`w-full p-6 sm:p-7 rounded-xl border-2 font-mono text-xs shadow-cardFrame transition-all ${
          isTampered
            ? "bg-[#FDF2F2] border-[#D9383A] text-[#223326] glow-red"
            : "bg-[#EBF3EE] border-2 border-[#5A7D5C] text-[#223326]"
        }`}
      >
        <div className="space-y-3">
          {/* Header Verdict Title */}
          <div className="flex items-center gap-3">
            {isTampered ? (
              <ShieldAlert className="w-6 h-6 text-[#D9383A] flex-shrink-0 animate-pulse" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-[#5A7D5C] flex-shrink-0" />
            )}
            <div>
              <h3
                className={`text-base font-black tracking-wider uppercase ${
                  isTampered ? "text-[#D9383A]" : "text-[#5A7D5C]"
                }`}
              >
                {isTampered
                  ? "CRITICAL INTEGRITY VIOLATION DETECTED"
                  : `ALL ${fileCount} EVIDENCE FILES VERIFIED INTACT`}
              </h3>
              <p className="text-xs text-[#5A6B5E] font-sans font-medium mt-0.5">
                {isTampered
                  ? "Cryptographic divergence identified between stored commitments and recomputed buffer hashes."
                  : "All SHA-256 digests match recorded commitments. Binary Merkle tree verified. Audit ledger link continuity confirmed."}
              </p>
            </div>
          </div>

          {/* Tampered Detailed Breakdown */}
          {isTampered && (
            <div className="pt-3 border-t-2 border-[#D9383A]/20 space-y-2 text-xs text-[#223326]">
              {verifyResult.tampered.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[#5A6B5E] font-bold">Corrupted File ID(s):</span>
                  <span className="px-2.5 py-1 rounded bg-[#FEE2E2] border border-[#FCA5A5] font-bold text-[#D9383A]">
                    {verifyResult.tampered.join(", ")}
                  </span>
                </div>
              )}

              {verifyResult.brokenPath.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[#5A6B5E] font-bold">Broken Merkle Path:</span>
                  <span className="px-3 py-1 rounded bg-[#D9383A] font-bold text-white flex items-center gap-1.5 shadow-sm">
                    <GitFork className="w-3.5 h-3.5" />
                    <span>{verifyResult.brokenPath.join(" → ")}</span>
                  </span>
                  <span className="text-xs text-[#5A6B5E]">
                    (Tracing Leaf #{verifyResult.brokenPath[0]} up to Root #{verifyResult.brokenPath[verifyResult.brokenPath.length - 1]})
                  </span>
                </div>
              )}

              {!verifyResult.chainValid && (
                <div className="flex items-center gap-2 text-[#D9383A] font-bold">
                  <Link2Off className="w-4 h-4" />
                  <span>Audit log chain link broken at Block #{verifyResult.brokenAt}</span>
                </div>
              )}

              {verifyResult.rootBefore !== verifyResult.rootAfter && (
                <div className="text-xs text-[#5A6B5E] font-mono pt-1">
                  Root Mismatch: Stored [{verifyResult.rootBefore ? verifyResult.rootBefore.slice(0, 8) : "None"}...] ≠ Recomputed [{verifyResult.rootAfter.slice(0, 8)}...]
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
