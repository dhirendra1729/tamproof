"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link2, AlertTriangle, CheckCircle2, ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const brokenBlockRef = useRef<HTMLDivElement>(null);
  const prevBlocksLengthRef = useRef(blocks.length);

  // Auto-scroll logic: if broken block exists, scroll to it; if new blocks added, scroll to right
  useEffect(() => {
    if (!chainValid && brokenAt >= 0 && brokenBlockRef.current) {
      brokenBlockRef.current.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    } else if (blocks.length > prevBlocksLengthRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
    prevBlocksLengthRef.current = blocks.length;
  }, [blocks.length, chainValid, brokenAt]);

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
    <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col select-none">
      {/* Box Header Bar */}
      <div className="bg-[#E2ECE5] border-b-2 border-[#BDCEBF] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link2 className="w-5 h-5 text-[#5A7D5C]" />
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-[#223326] font-mono">
              Cryptographic Audit Chain ({blocks.length} Blocks)
            </h2>
            <p className="text-xs text-[#5A6B5E] font-sans font-medium mt-0.5">
              Append-only tamper-evident hash linked ledger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          {chainValid ? (
            <span className="px-3.5 py-1.5 rounded-lg border-2 border-[#5A7D5C] bg-[#EBF3EE] text-[#5A7D5C] font-bold flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>CHAIN INTEGRITY INTACT</span>
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-lg border-2 border-[#D9383A] bg-[#FEE2E2] text-[#D9383A] font-bold animate-pulse flex items-center gap-1.5 shadow-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>CONTINUITY BROKEN AT BLOCK #{brokenAt}</span>
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {blocks.length === 0 ? (
          <div className="p-10 border-2 border-[#BDCEBF] rounded-xl text-center text-xs font-mono text-[#5A6B5E] bg-[#F4F8F5] flex flex-col items-center justify-center">
            <Link2 className="w-7 h-7 text-[#5A6B5E] mb-2 stroke-[1.5]" />
            <p className="text-base font-bold text-[#223326]">Genesis Block Pending</p>
            <p className="mt-1 text-xs text-[#5A6B5E]">Ingest evidence files or execute an action to begin the cryptographic ledger.</p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-4 custom-scrollbar flex items-center gap-4"
          >
            {blocks.map((block, idx) => {
              const isBroken = brokenAt === block.index;

              return (
                <React.Fragment key={block.index}>
                  <motion.div
                    ref={isBroken ? brokenBlockRef : undefined}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`min-w-[300px] max-w-[320px] p-5 rounded-xl border-2 text-xs font-mono flex flex-col justify-between transition-all shadow-sm ${
                      isBroken
                        ? "bg-[#FDF2F2] border-[#D9383A] ring-2 ring-[#D9383A] glow-red"
                        : "bg-[#F4F8F5] border-[#BDCEBF] hover:border-[#4A6150]"
                    }`}
                  >
                    {/* Block Header */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#BDCEBF]">
                      <span className="font-bold text-[#223326] text-sm">
                        Block #{block.index}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded text-[11px] font-bold ${getActionBadgeClass(
                          block.action
                        )}`}
                      >
                        {block.action}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="text-xs text-[#223326] font-bold truncate mb-3" title={block.details}>
                      {block.details}
                    </div>

                    {/* Hash links */}
                    <div className="space-y-2 text-[11px] text-[#5A6B5E] pt-2.5 border-t-2 border-[#BDCEBF]/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[#5A6B5E] font-medium">Prev Hash:</span>
                        <span className="text-[#223326] font-mono font-bold truncate max-w-[160px]" title={block.prevHash}>
                          {block.prevHash === "GENESIS" ? "GENESIS" : `${block.prevHash.slice(0, 8)}...${block.prevHash.slice(-6)}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#5A6B5E] font-medium">Block Hash:</span>
                        <span className="text-[#223326] font-mono font-bold truncate max-w-[160px]" title={block.hash}>
                          {block.hash.slice(0, 8)}...{block.hash.slice(-6)}
                        </span>
                      </div>
                    </div>

                    {/* Timestamp & Alert */}
                    <div className="mt-3 text-[11px] text-[#5A6B5E] text-right font-mono font-medium">
                      {block.timestamp.slice(11, 19)} UTC
                    </div>

                    {isBroken && (
                      <div className="mt-3 text-xs text-[#D9383A] font-bold bg-[#FEE2E2] p-2 rounded-lg text-center border-2 border-[#D9383A] flex items-center justify-center gap-1.5 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>LINK CONTINUITY BROKEN</span>
                      </div>
                    )}
                  </motion.div>

                  {idx < blocks.length - 1 && (
                    <div className="text-[#5A7D5C] px-1 flex-shrink-0">
                      <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </div>
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
