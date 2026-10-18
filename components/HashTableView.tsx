"use client";

import React from "react";
import { Database, AlertCircle, ArrowRight } from "lucide-react";
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
    <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col h-full select-none">
      {/* Box Header Bar */}
      <div className="bg-[#E2ECE5] border-b-2 border-[#BDCEBF] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-[#5A7D5C]" />
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-[#223326] font-mono">
              FNV-1a Hash Table ({totalEntries} items)
            </h2>
            <p className="text-xs text-[#5A6B5E] font-sans font-medium mt-0.5">
              Separate chaining with dynamic load balancing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono font-bold">
          <span className="text-[#5A6B5E] bg-white px-3 py-1.5 rounded-lg border border-[#BDCEBF]">
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
          <span className="text-[#5A6B5E] px-3 py-1.5 rounded-lg bg-white border border-[#BDCEBF]">
            Max Chain: {maxChain}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="overflow-y-auto max-h-[320px] custom-scrollbar border-2 border-[#BDCEBF] rounded-xl bg-[#F4F8F5] p-4 space-y-2.5">
          {buckets.length === 0 ? (
            <div className="text-center py-8 text-xs font-mono text-[#5A6B5E] flex flex-col items-center justify-center">
              <AlertCircle className="w-6 h-6 text-[#5A6B5E] mb-2 stroke-[1.5]" />
              <p className="text-sm font-bold text-[#223326]">Hash Table Uninitialized</p>
              <p className="mt-0.5">Ingest evidence files to allocate hash buckets.</p>
            </div>
          ) : (
            buckets.map((chain, bucketIdx) => {
              const hasItems = chain.length > 0;
              const hasCollision = chain.length > 1;

              return (
                <div
                  key={`bucket-${bucketIdx}`}
                  className={`p-3 rounded-xl border-2 text-xs font-mono flex items-center gap-3 transition-colors ${
                    hasCollision
                      ? "bg-[#FEF3C7] border-[#C48B47]"
                      : hasItems
                      ? "bg-white border-[#BDCEBF]"
                      : "bg-[#EDF4F0] border-transparent opacity-45"
                  }`}
                >
                  {/* Bucket Index */}
                  <div className="w-16 flex items-center gap-1 text-[#223326] font-bold">
                    <span className="text-xs">[{bucketIdx}]</span>
                  </div>

                  {/* Chain Nodes */}
                  <div className="flex-1 flex items-center gap-2 overflow-x-auto">
                    {chain.length === 0 ? (
                      <span className="text-[#5A6B5E] italic text-xs">empty</span>
                    ) : (
                      chain.map((entry, idx) => (
                        <React.Fragment key={`entry-${bucketIdx}-${idx}`}>
                          <div
                            className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold flex items-center gap-1.5 shadow-sm ${
                              hasCollision
                                ? "bg-white border-[#C48B47] text-[#92400E]"
                                : "bg-[#EBF3EE] border-[#5A7D5C] text-[#223326]"
                            }`}
                          >
                            <span className="text-[#5A6B5E] text-[11px]">#{idx}:</span>
                            <span className="truncate max-w-[150px]">{entry.key}</span>
                          </div>
                          {idx < chain.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-[#C48B47] flex-shrink-0 stroke-[2.5]" />
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </div>

                  {/* Collision badge */}
                  {hasCollision && (
                    <span className="text-[11px] font-bold text-[#92400E] px-2.5 py-1 rounded-md bg-[#FDE68A] border border-[#C48B47]">
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
