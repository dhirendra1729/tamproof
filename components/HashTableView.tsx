"use client";

import React from "react";
import { BucketEntry } from "@/lib/types";

interface HashTableViewProps {
  buckets: BucketEntry[][];
}

export function HashTableView({ buckets }: HashTableViewProps) {
  const totalEntries = buckets.reduce((acc, b) => acc + b.length, 0);
  const bucketCount = buckets.length;
  const loadFactor = bucketCount > 0 ? (totalEntries / bucketCount).toFixed(2) : "0.00";
  const maxChain = buckets.reduce((max, b) => Math.max(max, b.length), 0);

  return (
    <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col h-full">
      {/* Box Header Bar */}
      <div className="bg-[#E2ECE5] border-b-2 border-[#4A6150]/30 px-5 py-3.5 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#223326] font-mono">
          FNV-1a Hash Table ({totalEntries} items)
        </h2>
        <div className="flex items-center gap-3 text-xs font-mono font-bold">
          <span className="text-[#5A6B5E]">
            Load:{" "}
            <span
              className={
                parseFloat(loadFactor) > 0.75
                  ? "text-[#D9383A] font-bold"
                  : "text-[#223326] font-bold"
              }
            >
              {loadFactor}
            </span>{" "}
            / 0.75
          </span>
          <span className="text-[#5A6B5E] px-2 py-0.5 rounded bg-white border border-[#BDCEBF]">
            Max Chain: {maxChain}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="overflow-y-auto max-h-[280px] custom-scrollbar border-2 border-[#BDCEBF] rounded-lg bg-[#F4F8F5] p-3 space-y-2">
          {buckets.length === 0 ? (
            <div className="text-center py-6 text-xs font-mono text-[#5A6B5E]">
              Hash table uninitialized
            </div>
          ) : (
            buckets.map((chain, bucketIdx) => {
              const hasItems = chain.length > 0;
              const hasCollision = chain.length > 1;

              return (
                <div
                  key={`bucket-${bucketIdx}`}
                  className={`p-2.5 rounded-lg border-2 text-xs font-mono flex items-center gap-3 transition-colors ${
                    hasCollision
                      ? "bg-[#FEF3C7] border-2 border-[#C48B47]"
                      : hasItems
                      ? "bg-white border-2 border-[#BDCEBF]"
                      : "bg-[#EDF4F0] border-transparent opacity-40"
                  }`}
                >
                  {/* Bucket Index */}
                  <div className="w-16 flex items-center gap-1 text-[#223326] font-bold">
                    <span>[{bucketIdx}]</span>
                  </div>

                  {/* Chain Nodes */}
                  <div className="flex-1 flex items-center gap-2 overflow-x-auto">
                    {chain.length === 0 ? (
                      <span className="text-[#5A6B5E] italic text-[11px]">empty</span>
                    ) : (
                      chain.map((entry, idx) => (
                        <React.Fragment key={`entry-${bucketIdx}-${idx}`}>
                          <div
                            className={`px-3 py-1 rounded border-2 text-[11px] font-bold flex items-center gap-1.5 shadow-sm ${
                              hasCollision
                                ? "bg-white border-[#C48B47] text-[#92400E]"
                                : "bg-[#EBF3EE] border-[#5A7D5C] text-[#223326]"
                            }`}
                          >
                            <span className="text-[#5A6B5E] text-[10px]">#{idx}:</span>
                            <span className="truncate max-w-[140px]">{entry.key}</span>
                          </div>
                          {idx < chain.length - 1 && (
                            <span className="text-[#C48B47] font-bold text-xs flex-shrink-0">
                              →
                            </span>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </div>

                  {/* Collision badge */}
                  {hasCollision && (
                    <span className="text-[10px] font-bold text-[#92400E] px-2 py-0.5 rounded bg-[#FDE68A] border border-[#C48B47]">
                      COLLISION ({chain.length})
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
