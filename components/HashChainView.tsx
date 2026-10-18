"use client";

import React from "react";
import { Link2, ArrowRight, AlertOctagon, CheckCircle2 } from "lucide-react";
import { ChainBlock } from "@/lib/types";

interface HashChainViewProps {
  blocks: ChainBlock[];
  brokenAt: number;
  chainValid: boolean;
}

export function HashChainView({
  blocks,
  brokenAt,
  chainValid,
}: HashChainViewProps) {
  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case "ADD":
        return "bg-cyan-950/70 border-cyan-500/40 text-cyan-300";
      case "REPLACE":
        return "bg-blue-950/70 border-blue-500/40 text-blue-300";
      case "VERIFY":
        return "bg-emerald-950/70 border-emerald-500/40 text-emerald-300";
      case "VERIFY FAILED":
        return "bg-red-950/80 border-red-500 text-red-300 font-bold animate-pulse";
      case "UNDO":
        return "bg-purple-950/70 border-purple-500/40 text-purple-300";
      case "URGENT_VERIFIED":
        return "bg-amber-950/70 border-amber-500/40 text-amber-300";
      case "URGENT_FAILED":
        return "bg-red-950/80 border-red-500 text-red-300";
      default:
        return "bg-gray-800 border-gray-600 text-gray-300";
    }
  };

  return (
    <div className="bg-[#11161f] border border-[#1f2937] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-200 font-mono">
            Cryptographic Audit Chain ({blocks.length} Blocks)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          {chainValid ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Links Intact
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-red-400 font-bold animate-pulse">
              <AlertOctagon className="w-3.5 h-3.5" />
              Broken at Block #{brokenAt}
            </span>
          )}
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="p-6 border border-dashed border-[#1f2937] rounded text-center text-xs font-mono text-gray-500">
          Genesis block pending. Ingest evidence to begin audit ledger.
        </div>
      ) : (
        <div className="overflow-x-auto pb-3 custom-scrollbar flex items-center gap-3">
          {blocks.map((block, idx) => {
            const isBroken = brokenAt === static_cast_int(block.index);

            return (
              <React.Fragment key={block.index}>
                <div
                  className={`min-w-[240px] max-w-[260px] p-3.5 rounded-lg border text-xs font-mono flex flex-col justify-between transition-all ${
                    isBroken
                      ? "bg-red-950/60 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] glow-red"
                      : "bg-[#0a0e14] border-[#1f2937] hover:border-cyan-500/40"
                  }`}
                >
                  {/* Block Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-200">
                      Block #{block.index}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] border ${getActionBadgeClass(
                        block.action
                      )}`}
                    >
                      {block.action}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="text-[11px] text-gray-300 font-medium truncate mb-2" title={block.details}>
                    {block.details}
                  </div>

                  {/* Hash links */}
                  <div className="space-y-1 text-[10px] text-gray-400 pt-2 border-t border-[#1f2937]/70">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Prev:</span>
                      <span className="text-gray-400 truncate max-w-[140px]" title={block.prevHash}>
                        {block.prevHash === "GENESIS" ? "GENESIS" : `${block.prevHash.slice(0, 8)}...`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Hash:</span>
                      <span className="text-cyan-400/90 truncate max-w-[140px]" title={block.hash}>
                        {block.hash.slice(0, 8)}...
                      </span>
                    </div>
                  </div>

                  {/* Timestamp & Alert */}
                  <div className="mt-2 text-[9px] text-gray-500 text-right">
                    {block.timestamp.slice(11, 19)} UTC
                  </div>

                  {isBroken && (
                    <div className="mt-2 text-[10px] text-red-400 font-bold bg-red-950/90 p-1 rounded text-center border border-red-500/60">
                      ⚠️ HASH LINK BROKEN
                    </div>
                  )}
                </div>

                {idx < blocks.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-cyan-500/50 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

function static_cast_int(num: number): number {
  return num;
}
