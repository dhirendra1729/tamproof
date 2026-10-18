"use client";

import React from "react";
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
        return "bg-[#EBF3EE] border-2 border-[#5A7D5C] text-[#5A7D5C]";
      case "REPLACE":
        return "bg-[#E0F2FE] border-2 border-[#0284C7] text-[#0369A1]";
      case "VERIFY":
        return "bg-[#EBF3EE] border-2 border-[#5A7D5C] text-[#223326] font-bold";
      case "VERIFY FAILED":
        return "bg-[#FEE2E2] border-2 border-[#D9383A] text-[#D9383A] font-bold animate-pulse";
      case "UNDO":
        return "bg-[#F3E8FF] border-2 border-[#7E22CE] text-[#7E22CE]";
      case "URGENT_VERIFIED":
        return "bg-[#FEF3C7] border-2 border-[#C48B47] text-[#92400E]";
      case "URGENT_FAILED":
        return "bg-[#FEE2E2] border-2 border-[#D9383A] text-[#D9383A]";
      default:
        return "bg-[#F4F8F5] border-2 border-[#BDCEBF] text-[#223326]";
    }
  };

  return (
    <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col">
      {/* Box Header Bar */}
      <div className="bg-[#E2ECE5] border-b-2 border-[#4A6150]/30 px-5 py-3.5 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#223326] font-mono">
          Cryptographic Audit Chain ({blocks.length} Blocks)
        </h2>
        <div className="flex items-center gap-2 text-xs font-mono">
          {chainValid ? (
            <span className="px-3 py-1 rounded border-2 border-[#5A7D5C] bg-[#EBF3EE] text-[#5A7D5C] font-bold">
              [LINKS INTACT]
            </span>
          ) : (
            <span className="px-3 py-1 rounded border-2 border-[#D9383A] bg-[#FEE2E2] text-[#D9383A] font-bold animate-pulse">
              [BROKEN AT BLOCK #{brokenAt}]
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        {blocks.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-[#BDCEBF] rounded-lg text-center text-xs font-mono text-[#5A6B5E] bg-[#F4F8F5]">
            Genesis block pending. Ingest evidence to begin audit ledger.
          </div>
        ) : (
          <div className="overflow-x-auto pb-4 custom-scrollbar flex items-center gap-3">
            {blocks.map((block, idx) => {
              const isBroken = brokenAt === block.index;

              return (
                <React.Fragment key={block.index}>
                  <div
                    className={`min-w-[270px] max-w-[290px] p-4 rounded-lg border-2 text-xs font-mono flex flex-col justify-between transition-all shadow-sm ${
                      isBroken
                        ? "bg-[#FDF2F2] border-[#D9383A] glow-red"
                        : "bg-[#F4F8F5] border-[#BDCEBF] hover:border-[#223326]"
                    }`}
                  >
                    {/* Block Header */}
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b-2 border-[#BDCEBF]/60">
                      <span className="font-bold text-[#223326] text-sm">
                        Block #{block.index}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${getActionBadgeClass(
                          block.action
                        )}`}
                      >
                        {block.action}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="text-[11px] text-[#223326] font-bold truncate mb-2.5" title={block.details}>
                      {block.details}
                    </div>

                    {/* Hash links */}
                    <div className="space-y-1.5 text-[10px] text-[#5A6B5E] pt-2 border-t-2 border-[#BDCEBF]/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[#5A6B5E] font-medium">Prev:</span>
                        <span className="text-[#223326] font-mono font-bold truncate max-w-[150px]" title={block.prevHash}>
                          {block.prevHash === "GENESIS" ? "GENESIS" : `${block.prevHash.slice(0, 8)}...`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#5A6B5E] font-medium">Hash:</span>
                        <span className="text-[#223326] font-mono font-bold truncate max-w-[150px]" title={block.hash}>
                          {block.hash.slice(0, 8)}...
                        </span>
                      </div>
                    </div>

                    {/* Timestamp & Alert */}
                    <div className="mt-2 text-[9px] text-[#5A6B5E] text-right font-mono font-medium">
                      {block.timestamp.slice(11, 19)} UTC
                    </div>

                    {isBroken && (
                      <div className="mt-2 text-[10px] text-[#D9383A] font-bold bg-[#FEE2E2] p-1.5 rounded text-center border-2 border-[#D9383A]">
                        LINK CONTINUITY BROKEN
                      </div>
                    )}
                  </div>

                  {idx < blocks.length - 1 && (
                    <span className="text-base font-bold text-[#5A7D5C] px-1 flex-shrink-0">
                      →
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
