"use client";

import React from "react";
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
  const isTampered =
    Boolean(verifyResult && verifyResult.tampered.length > 0) ||
    vaultState?.files.some((f) => f.status === "tampered") ||
    vaultState?.chainValid === false;

  const rootMismatch =
    Boolean(verifyResult &&
    verifyResult.rootBefore &&
    verifyResult.rootAfter &&
    verifyResult.rootBefore !== verifyResult.rootAfter);

  const displayedRoot = vaultState?.merkleRoot || "EMPTY";
  const truncatedRoot =
    displayedRoot.length > 16
      ? `${displayedRoot.slice(0, 8)}...${displayedRoot.slice(-8)}`
      : displayedRoot;

  return (
    <header className="border-b-2 border-[#4A6150]/40 bg-white sticky top-0 z-50 px-6 py-4 shadow-sm">
      {vaultState?.coreRestarted && (
        <div className="mb-3 px-4 py-2 bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-lg text-[#92400E] text-xs font-mono font-medium flex items-center justify-between">
          <span>Notice: C++ core process was restarted. In-memory state was reset to genesis.</span>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title and Engineering Subtitle */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-[#223326] font-mono">
              TAMPER-PROOF EVIDENCE VAULT
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#EBF3EE] border-2 border-[#5A7D5C] text-[#5A7D5C]">
              C++17 Engine
            </span>
          </div>
          <p className="text-xs text-[#5A6B5E] mt-0.5 font-sans font-medium">
            Forensic Custody Architecture • Binary Merkle Tree &amp; SHA-256 Hash Chain Ledger
          </p>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Vault Status Indicator */}
          <div
            className={`px-3.5 py-1.5 rounded-lg border-2 text-xs font-mono font-bold flex items-center gap-2 ${
              isTampered
                ? "bg-[#FDF2F2] border-[#D9383A] text-[#D9383A] glow-red"
                : isIngesting
                ? "bg-[#FEF3C7] border-[#C48B47] text-[#92400E] animate-pulse"
                : "bg-[#EBF3EE] border-[#5A7D5C] text-[#223326]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isTampered
                  ? "bg-[#D9383A] animate-ping"
                  : isIngesting
                  ? "bg-[#C48B47]"
                  : "bg-[#5A7D5C]"
              }`}
            />
            {isTampered
              ? "TAMPER DETECTED"
              : isIngesting
              ? "INGESTING..."
              : "VAULT SECURED"}
          </div>

          {/* Merkle Root Box */}
          <div className="px-3.5 py-1.5 rounded-lg border-2 border-[#BDCEBF] bg-[#F4F8F5] text-xs font-mono flex items-center gap-2">
            <span className="text-[#5A6B5E] font-bold">Root:</span>
            {rootMismatch ? (
              <span className="text-[#D9383A] font-bold px-1.5 py-0.5 bg-[#FDF2F2] rounded border border-[#D9383A]">
                MISMATCH
              </span>
            ) : (
              <span
                className="text-[#223326] font-bold cursor-help"
                title={displayedRoot}
              >
                {truncatedRoot}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <button
            onClick={onUndo}
            disabled={!vaultState?.stack || vaultState.stack.length === 0}
            className="px-3 py-1.5 rounded-lg border-2 border-[#BDCEBF] bg-white hover:bg-[#EBF3EE] hover:border-[#5A7D5C] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-bold text-[#223326] transition-colors shadow-sm"
            title="Undo last action via LIFO Stack"
          >
            Undo Action
          </button>

          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg border-2 border-[#FCA5A5] bg-[#FDF2F2] hover:bg-[#FEE2E2] text-xs font-mono font-bold text-[#D9383A] transition-colors shadow-sm"
            title="Reset vault state"
          >
            Reset Vault
          </button>
        </div>
      </div>
    </header>
  );
}
