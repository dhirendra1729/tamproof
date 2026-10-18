"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, Undo2, RotateCcw, Copy, Check } from "lucide-react";
import { VaultState, VerifyResult } from "@/lib/types";

interface HeaderProps {
  vaultState: VaultState | null;
  verifyResult: VerifyResult | null;
  isIngesting: boolean;
  onReset: () => void;
  onUndo: () => void;
}

export function Header({
  vaultState,
  verifyResult,
  isIngesting,
  onReset,
  onUndo,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const isUndone = Boolean(
    vaultState?.chain &&
      vaultState.chain.length > 0 &&
      vaultState.chain[vaultState.chain.length - 1].action === "UNDO"
  );

  // Preserve the deliberate suspense mechanic & handle smooth undo restoration
  const isTampered =
    !isUndone &&
    (Boolean(
      verifyResult &&
        (verifyResult.tampered.length > 0 ||
          verifyResult.brokenPath.length > 0 ||
          !verifyResult.chainValid ||
          (verifyResult.rootBefore !== verifyResult.rootAfter && (vaultState?.files.length ?? 0) > 0))
    ) || vaultState?.chainValid === false);

  const currentRoot = vaultState?.merkleRoot || "EMPTY";

  const formatHash = (h: string) => {
    if (!h || h === "EMPTY") return "EMPTY";
    return h.length > 16 ? `${h.slice(0, 8)}...${h.slice(-8)}` : h;
  };

  const copyRoot = () => {
    if (!currentRoot || currentRoot === "EMPTY") return;
    navigator.clipboard.writeText(currentRoot);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const rootBefore = verifyResult?.rootBefore;
  const rootAfter = verifyResult?.rootAfter;
  const hasRootMismatch = !isUndone && Boolean(rootBefore && rootAfter && rootBefore !== rootAfter);

  return (
    <header className="border-b-2 border-[#4A6150] bg-white sticky top-0 z-50 px-6 sm:px-10 py-4 shadow-sm">
      {vaultState?.coreRestarted && (
        <div className="mb-3 px-4 py-2 bg-[#FEF3C7] border-2 border-[#C48B47] rounded-lg text-[#92400E] text-xs font-mono font-semibold flex items-center justify-between">
          <span>Notice: C++ core process was restarted. In-memory state was reset to genesis.</span>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Project Branding */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#223326] font-mono">
              TAMPER-PROOF EVIDENCE VAULT
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#EBF3EE] border-2 border-[#5A7D5C] text-[#5A7D5C]">
              C++17 Engine
            </span>
          </div>
          <p className="text-xs text-[#5A6B5E] mt-1 font-sans font-medium">
            Forensic Custody Architecture • Binary Merkle Tree &amp; SHA-256 Hash Chain Ledger
          </p>
        </div>

        {/* Center & Right: Live Status & Actions */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Animated Status Pill */}
          <div className="min-w-[170px]">
            {isTampered ? (
              <motion.div
                key="tampered"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="px-4 py-2.5 rounded-lg border-2 border-[#D9383A] bg-[#FDF2F2] text-[#D9383A] font-mono font-bold text-xs flex items-center gap-2 shadow-sm glow-red"
              >
                <ShieldAlert className="w-4 h-4 text-[#D9383A] animate-pulse flex-shrink-0" />
                <span>TAMPER DETECTED</span>
              </motion.div>
            ) : isIngesting ? (
              <motion.div
                key="ingesting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="px-4 py-2.5 rounded-lg border-2 border-[#C48B47] bg-[#FEF3C7] text-[#92400E] font-mono font-bold text-xs flex items-center gap-2 shadow-sm animate-pulse"
              >
                <span className="w-2 h-2 rounded-full bg-[#C48B47]" />
                <span>INGESTING...</span>
              </motion.div>
            ) : (
              <motion.div
                key="secured"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="px-4 py-2.5 rounded-lg border-2 border-[#5A7D5C] bg-[#EBF3EE] text-[#223326] font-mono font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-[#5A7D5C] flex-shrink-0" />
                <span>VAULT SECURED</span>
              </motion.div>
            )}
          </div>

          {/* Merkle Root Chip */}
          <div
            onClick={copyRoot}
            title={currentRoot !== "EMPTY" ? `Click to copy full hash:\n${currentRoot}` : "Root empty"}
            className="px-3.5 py-2.5 rounded-lg border-2 border-[#BDCEBF] bg-[#F4F8F5] text-xs font-mono flex items-center gap-2 cursor-pointer hover:border-[#4A6150] transition-colors shadow-sm"
          >
            <span className="text-[#5A6B5E] font-semibold text-[11px]">Root:</span>
            {hasRootMismatch ? (
              <div className="flex items-center gap-1 font-bold">
                <span className="line-through text-[#D9383A]/70">{formatHash(rootBefore!)}</span>
                <span className="text-[#D9383A]">→</span>
                <span className="text-[#D9383A]">{formatHash(rootAfter!)}</span>
              </div>
            ) : (
              <span className={`font-bold ${isTampered ? "text-[#D9383A]" : "text-[#223326]"}`}>
                {formatHash(currentRoot)}
              </span>
            )}
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#5A7D5C]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#5A6B5E]" />
            )}
          </div>

          {/* Action Buttons */}
          <button
            onClick={onUndo}
            disabled={!vaultState?.stack || vaultState.stack.length === 0}
            className="px-4 py-2.5 rounded-lg border-2 border-[#BDCEBF] bg-white hover:bg-[#EBF3EE] hover:border-[#5A7D5C] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-bold text-[#223326] transition-colors shadow-sm flex items-center gap-1.5"
            title="Undo last action via LIFO Stack (Reverses mutation)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            onClick={onReset}
            className="px-4 py-2.5 rounded-lg border-2 border-[#FCA5A5] bg-[#FDF2F2] hover:bg-[#FEE2E2] text-xs font-mono font-bold text-[#D9383A] transition-colors shadow-sm flex items-center gap-1.5"
            title="Reset vault state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}
