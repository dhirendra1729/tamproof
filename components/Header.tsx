"use client";

import React from "react";
import { Shield, ShieldAlert, ShieldCheck, RefreshCw, RotateCcw, Cpu } from "lucide-react";
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
    <header className="border-b border-[#1f2937] bg-[#11161f]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      {vaultState?.coreRestarted && (
        <div className="mb-3 px-4 py-2 bg-amber-950/60 border border-amber-600/50 rounded text-amber-300 text-xs flex items-center justify-between">
          <span>⚠️ Notice: C++ core process was restarted. In-memory state was reset.</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title and Tech Badges */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            {isTampered ? (
              <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                TAMPER-PROOF EVIDENCE VAULT
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-cyan-950/70 border border-cyan-500/40 text-cyan-300">
                <Cpu className="w-3 h-3 text-cyan-400" />
                core: C++17 (live process)
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Forensic custody simulator backed by hand-written Merkle tree, hash chain, and separate-chaining index.
            </p>
          </div>
        </div>

        {/* Center/Right Status & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Vault Status Pill */}
          <div
            className={`px-3 py-1.5 rounded-full border text-xs font-mono font-semibold flex items-center gap-2 ${
              isTampered
                ? "bg-red-950/70 border-red-500 text-red-300 glow-red"
                : isIngesting
                ? "bg-cyan-950/70 border-cyan-400 text-cyan-300 animate-pulse"
                : "bg-emerald-950/50 border-emerald-500/60 text-emerald-300"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isTampered
                  ? "bg-red-400 animate-ping"
                  : isIngesting
                  ? "bg-cyan-400"
                  : "bg-emerald-400"
              }`}
            />
            {isTampered
              ? "TAMPER DETECTED"
              : isIngesting
              ? "INGESTING EVIDENCE..."
              : "VAULT SECURED"}
          </div>

          {/* Merkle Root Pill */}
          <div className="px-3 py-1.5 rounded border border-[#1f2937] bg-[#0a0e14] text-xs font-mono flex items-center gap-2">
            <span className="text-gray-400">Merkle Root:</span>
            {rootMismatch ? (
              <span className="text-red-400 font-bold animate-pulse px-1.5 py-0.5 bg-red-950/80 rounded border border-red-500/50">
                MISMATCH DETECTED
              </span>
            ) : (
              <span
                className="text-cyan-300 font-medium cursor-help"
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
            className="px-3 py-1.5 rounded border border-[#1f2937] bg-[#11161f] hover:bg-[#1a2332] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-colors"
            title="Undo last non-tamper action using LIFO Stack"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Undo
          </button>

          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded border border-red-900/40 bg-red-950/30 hover:bg-red-900/50 text-xs font-mono text-red-300 flex items-center gap-1.5 transition-colors"
            title="Reset vault state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}
