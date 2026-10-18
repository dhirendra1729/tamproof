"use client";

import React from "react";

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
    <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col justify-between h-full">
      {/* Box Header Bar */}
      <div className="bg-[#E2ECE5] border-b-2 border-[#4A6150]/30 px-5 py-3.5 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#223326] font-mono">
          Data Structure Inspector
        </h2>
        <span className="text-[11px] font-mono font-bold text-[#5A6B5E] px-2 py-0.5 rounded bg-white border border-[#BDCEBF]">
          C++ In-Memory
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* 1. Stack (Undo History) */}
        <div className="border-2 border-[#BDCEBF] rounded-lg p-3.5 bg-[#F4F8F5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#223326] uppercase">
              LIFO Stack (Undo History)
            </span>
            <span className="text-[10px] font-mono font-bold text-[#7E22CE] px-2 py-0.5 rounded bg-[#F3E8FF] border border-[#7E22CE]">
              size: {stack.length}
            </span>
          </div>
          {stack.length === 0 ? (
            <p className="text-[11px] font-mono text-[#5A6B5E] italic">Stack empty (no actions to reverse)</p>
          ) : (
            <div className="space-y-1.5 max-h-[85px] overflow-y-auto custom-scrollbar">
              {stack.map((item, idx) => (
                <div
                  key={idx}
                  className="text-[10px] font-mono px-2.5 py-1 rounded bg-white border border-[#BDCEBF] text-[#223326] flex items-center justify-between font-bold"
                >
                  <span className="truncate">{item}</span>
                  <span className="text-[9px] text-[#5A6B5E]">#{idx}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. CircularQueue (Ingestion Pipeline) */}
        <div className="border-2 border-[#BDCEBF] rounded-lg p-3.5 bg-[#F4F8F5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#223326] uppercase">
              CircularQueue (Ingest Buffer)
            </span>
            <span className="text-[10px] font-mono font-bold text-[#5A7D5C] px-2 py-0.5 rounded bg-[#EBF3EE] border border-[#5A7D5C]">
              {queue.length} / 64
            </span>
          </div>
          {queue.length === 0 ? (
            <p className="text-[11px] font-mono text-[#5A6B5E] italic">Queue empty (all files ingested)</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-[70px] overflow-y-auto custom-scrollbar">
              {queue.map((item, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono px-2.5 py-1 rounded bg-white border-2 border-[#5A7D5C] text-[#223326] font-bold"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. MinHeap (Urgent Verification Queue) */}
        <div className="border-2 border-[#BDCEBF] rounded-lg p-3.5 bg-[#F4F8F5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#223326] uppercase">
              MinHeap (Urgent Priority)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[#92400E] px-2 py-0.5 rounded bg-[#FEF3C7] border border-[#C48B47]">
                size: {urgentHeap.length}
              </span>
              <button
                onClick={onProcessUrgent}
                disabled={urgentHeap.length === 0}
                className="px-2.5 py-1 rounded bg-[#C48B47] hover:bg-[#92400E] text-white font-bold text-[10px] font-mono disabled:opacity-40 transition-colors shadow-sm"
              >
                Pop Next
              </button>
            </div>
          </div>
          {urgentHeap.length === 0 ? (
            <p className="text-[11px] font-mono text-[#5A6B5E] italic">No urgent files queued</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-[70px] overflow-y-auto custom-scrollbar">
              {urgentHeap.map((fileId, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#FEF3C7] border-2 border-[#C48B47] text-[#92400E] font-bold"
                >
                  File #{fileId}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
