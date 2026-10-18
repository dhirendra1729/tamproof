"use client";

import React from "react";
import { Database, Hash, ArrowRight } from "lucide-react";
import { BucketEntry } from "@/lib/types";

interface HashTableViewProps {
  buckets: BucketEntry[][];
}

export function HashTableView({ buckets }: HashTableViewProps) {
  const totalEntries = buckets.reduce((acc, b) => acc + b.length, 0);
  const bucketCount = buckets.length;
  const loadFactor = bucketCount > 0 ? (totalEntries / bucketCount).toFixed(2) : "0.00";
  const nonZeroBuckets = buckets.filter((b) => b.length > 0).length;
  const maxChain = buckets.reduce((max, b) => Math.max(max, b.length), 0);

  return (
    <div className="bg-[#11161f] border border-[#1f2937] rounded-lg p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-200 font-mono">
            FNV-1a Hash Table ({totalEntries} items, {bucketCount} buckets)
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-gray-400">
            Load Factor:{" "}
            <span
              className={
                parseFloat(loadFactor) > 0.75
                  ? "text-red-400 font-bold"
                  : "text-cyan-300 font-bold"
              }
            >
              {loadFactor}
            </span>{" "}
            / 0.75
          </span>
          <span className="text-gray-500">Max Chain: {maxChain}</span>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[260px] custom-scrollbar border border-[#1f2937] rounded-md bg-[#0a0e14] p-3 space-y-2">
        {buckets.length === 0 ? (
          <div className="text-center py-6 text-xs font-mono text-gray-500">
            Hash table uninitialized
          </div>
        ) : (
          buckets.map((chain, bucketIdx) => {
            const hasItems = chain.length > 0;
            const hasCollision = chain.length > 1;

            return (
              <div
                key={`bucket-${bucketIdx}`}
                className={`p-2 rounded border text-xs font-mono flex items-center gap-3 transition-colors ${
                  hasCollision
                    ? "bg-amber-950/20 border-amber-600/40"
                    : hasItems
                    ? "bg-[#11161f] border-[#1f2937]"
                    : "bg-[#0d1219]/40 border-transparent opacity-40"
                }`}
              >
                {/* Bucket Index */}
                <div className="w-16 flex items-center gap-1 text-gray-400 font-bold">
                  <Hash className="w-3 h-3 text-cyan-500" />
                  <span>[{bucketIdx}]</span>
                </div>

                {/* Chain Nodes */}
                <div className="flex-1 flex items-center gap-2 overflow-x-auto">
                  {chain.length === 0 ? (
                    <span className="text-gray-600 italic text-[11px]">empty</span>
                  ) : (
                    chain.map((entry, idx) => (
                      <React.Fragment key={`entry-${bucketIdx}-${idx}`}>
                        <div
                          className={`px-2.5 py-1 rounded border text-[11px] font-medium flex items-center gap-1.5 ${
                            hasCollision
                              ? "bg-amber-950/50 border-amber-500/50 text-amber-300"
                              : "bg-cyan-950/40 border-cyan-500/30 text-cyan-300"
                          }`}
                        >
                          <span className="text-gray-400 text-[9px]">#{idx}:</span>
                          <span className="truncate max-w-[120px]">{entry.key}</span>
                        </div>
                        {idx < chain.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        )}
                      </React.Fragment>
                    ))
                  )}
                </div>

                {/* Collision badge */}
                {hasCollision && (
                  <span className="text-[10px] font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/50">
                    COLLISION ({chain.length})
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
