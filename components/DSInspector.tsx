"use client";

import React from "react";
import { Layers, RefreshCw, Cpu, Flame, History, ArrowDownCircle } from "lucide-react";

interface DSInspectorProps {
  stack: string[];
  queue: string[];
  urgentHeap: string[];
  onProcessUrgent: () => void;
}

export function DSInspector({
  stack,
  queue,
  urgentHeap,
  onProcessUrgent,
}: DSInspectorProps) {
  return (
    <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col select-none">
      {/* Box Header Bar */}
      <div className="bg-[#E2ECE5] border-b-2 border-[#BDCEBF] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-[#5A7D5C]" />
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-[#223326] font-mono">
              In-Memory Data Structure Inspector
            </h2>
            <p className="text-xs text-[#5A6B5E] font-sans font-medium mt-0.5">
              Live inspection of C++ stack, circular queue, and priority min-heap
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-[#5A6B5E] px-3 py-1 rounded-lg bg-white border border-[#BDCEBF]">
          C++17 Engine Core
        </span>
      </div>

      {/* 3-Column Strip on lg screens */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* 1. Stack (Undo History) */}
        <div className="border-2 border-[#BDCEBF] rounded-xl p-5 bg-[#F4F8F5] flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#BDCEBF]/60">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#7E22CE]" />
                <span className="text-xs font-mono font-bold text-[#223326] uppercase">
                  LIFO Stack (Undo Ledger)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#7E22CE] px-2.5 py-0.5 rounded-md bg-[#F3E8FF] border border-[#7E22CE]/40">
                depth: {stack.length}
              </span>
            </div>

            {stack.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-[#5A6B5E] italic">
                Stack empty (no actions to reverse)
              </div>
            ) : (
              <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                {stack.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-xs font-mono px-3 py-2 rounded-lg bg-white border border-[#BDCEBF] text-[#223326] flex items-center justify-between font-bold shadow-xs"
                  >
                    <span className="truncate max-w-[200px]" title={item}>{item}</span>
                    <span className="text-[11px] text-[#5A6B5E] ml-2">#{idx}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] font-mono text-[#5A6B5E] mt-3 pt-2 border-t border-[#BDCEBF]/40">
            Last-in, first-out command rollback buffer
          </p>
        </div>

        {/* 2. CircularQueue (Ingestion Pipeline) */}
        <div className="border-2 border-[#BDCEBF] rounded-xl p-5 bg-[#F4F8F5] flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#BDCEBF]/60">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4 text-[#5A7D5C]" />
                <span className="text-xs font-mono font-bold text-[#223326] uppercase">
                  CircularQueue (Ingest Buffer)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#5A7D5C] px-2.5 py-0.5 rounded-md bg-[#EBF3EE] border border-[#5A7D5C]/40">
                {queue.length} / 64 slots
              </span>
            </div>

            {queue.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-[#5A6B5E] italic">
                Queue idle (all files committed to vault)
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto custom-scrollbar p-1">
                {queue.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white border-2 border-[#5A7D5C] text-[#223326] font-bold shadow-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] font-mono text-[#5A6B5E] mt-3 pt-2 border-t border-[#BDCEBF]/40">
            FIFO fixed-ring buffer for asynchronous batch ingestion
          </p>
        </div>

        {/* 3. MinHeap (Urgent Priority Queue) */}
        <div className="border-2 border-[#BDCEBF] rounded-xl p-5 bg-[#F4F8F5] flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#BDCEBF]/60">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#C48B47]" />
                <span className="text-xs font-mono font-bold text-[#223326] uppercase">
                  MinHeap (Urgent Queue)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#92400E] px-2.5 py-0.5 rounded-md bg-[#FEF3C7] border border-[#C48B47]/40">
                  {urgentHeap.length}
                </span>
                <button
                  onClick={onProcessUrgent}
                  disabled={urgentHeap.length === 0}
                  className="px-3 py-1.5 rounded-lg bg-[#C48B47] hover:bg-[#92400E] text-white font-bold text-xs font-mono disabled:opacity-40 transition-colors shadow-sm uppercase tracking-wider"
                >
                  Pop Next
                </button>
              </div>
            </div>

            {urgentHeap.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-[#5A6B5E] italic">
                No expedited files in priority heap
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto custom-scrollbar p-1">
                {urgentHeap.map((fileId, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#FEF3C7] border-2 border-[#C48B47] text-[#92400E] font-bold shadow-xs"
                  >
                    File #{fileId}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] font-mono text-[#5A6B5E] mt-3 pt-2 border-t border-[#BDCEBF]/40">
            Binary min-heap providing O(log n) expedited processing
          </p>
        </div>
      </div>
    </div>
  );
}
