"use client";

import React from "react";
import { Layers, RotateCcw, ListOrdered, Zap, Play } from "lucide-react";

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
    <div className="bg-[#11161f] border border-[#1f2937] rounded-lg p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-200 font-mono">
            Data Structure Inspector
          </h2>
        </div>

        <div className="space-y-4">
          {/* 1. Stack (Undo History) */}
          <div className="border border-[#1f2937] rounded-md p-3 bg-[#0a0e14]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-gray-300 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                LIFO Stack (Undo History)
              </span>
              <span className="text-[10px] font-mono text-purple-400 px-1.5 py-0.2 rounded bg-purple-950/40 border border-purple-500/30">
                size: {stack.length}
              </span>
            </div>
            {stack.length === 0 ? (
              <p className="text-[11px] font-mono text-gray-600 italic">Stack empty</p>
            ) : (
              <div className="space-y-1 max-h-[85px] overflow-y-auto custom-scrollbar">
                {stack.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-[10px] font-mono px-2 py-1 rounded bg-[#11161f] border border-[#1f2937] text-gray-300 flex items-center justify-between"
                  >
                    <span className="truncate">{item}</span>
                    <span className="text-[9px] text-gray-500">#{idx}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. CircularQueue (Ingestion Pipeline) */}
          <div className="border border-[#1f2937] rounded-md p-3 bg-[#0a0e14]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-gray-300 flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
                CircularQueue (Ingest Buffer)
              </span>
              <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950/40 border border-cyan-500/30">
                {queue.length} / 64
              </span>
            </div>
            {queue.length === 0 ? (
              <p className="text-[11px] font-mono text-gray-600 italic">Queue empty (all files ingested)</p>
            ) : (
              <div className="flex flex-wrap gap-1 max-h-[70px] overflow-y-auto custom-scrollbar">
                {queue.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 3. MinHeap (Urgent Verification Queue) */}
          <div className="border border-[#1f2937] rounded-md p-3 bg-[#0a0e14]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-gray-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                MinHeap (Urgent Priority)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.2 rounded bg-amber-950/40 border border-amber-500/30">
                  size: {urgentHeap.length}
                </span>
                <button
                  onClick={onProcessUrgent}
                  disabled={urgentHeap.length === 0}
                  className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] font-mono flex items-center gap-1 disabled:opacity-40 transition-colors"
                >
                  <Play className="w-2.5 h-2.5 fill-black" />
                  Pop
                </button>
              </div>
            </div>
            {urgentHeap.length === 0 ? (
              <p className="text-[11px] font-mono text-gray-600 italic">No urgent files queued</p>
            ) : (
              <div className="flex flex-wrap gap-1 max-h-[70px] overflow-y-auto custom-scrollbar">
                {urgentHeap.map((fileId, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/50 text-amber-300 font-bold"
                  >
                    File #{fileId}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
