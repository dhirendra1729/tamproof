"use client";

import React from "react";
import { Binary, Gauge, Layers } from "lucide-react";
import { EvidenceFile } from "@/lib/types";

interface HuffmanPanelProps {
  selectedFile: EvidenceFile | null;
}

export function HuffmanPanel({ selectedFile }: HuffmanPanelProps) {
  if (!selectedFile) {
    return (
      <div className="bg-[#11161f] border border-[#1f2937] rounded-lg p-5 flex flex-col justify-between h-full">
        <div className="flex items-center gap-2 mb-3">
          <Binary className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-200 font-mono">
            Huffman Lossless Compression
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-[#1f2937] rounded text-center text-xs font-mono text-gray-500">
          Select an evidence file above to inspect its Huffman binary tree encoding.
        </div>
      </div>
    );
  }

  const originalBytes = selectedFile.size;
  const compressedBits = selectedFile.huffmanBits;
  const compressedBytes = Math.ceil(compressedBits / 8);
  const ratio = selectedFile.compressionRatio;
  const spaceSavingsPct = originalBytes > 0
    ? Math.max(0, Math.round((1 - compressedBytes / originalBytes) * 100))
    : 0;

  // Sample prefix code table preview for UI demonstration
  const sampleCodes = [
    { char: "space (' ')", freq: "18%", code: "01" },
    { char: "letter 'e'", freq: "12%", code: "100" },
    { char: "letter 't'", freq: "9%", code: "1010" },
    { char: "letter 'a'", freq: "8%", code: "1011" },
    { char: "letter 'o'", freq: "7%", code: "1100" },
    { char: "letter 'n'", freq: "7%", code: "1101" },
    { char: "newline ('\\n')", freq: "5%", code: "1110" },
    { char: "other bytes", freq: "34%", code: "1111..." },
  ];

  return (
    <div className="bg-[#11161f] border border-[#1f2937] rounded-lg p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Binary className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-200 font-mono">
              Huffman Coding: {selectedFile.name}
            </h2>
          </div>
          <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Constructed with MinHeap
          </span>
        </div>

        {/* Compression Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4 font-mono text-xs">
          <div className="p-2.5 rounded bg-[#0a0e14] border border-[#1f2937]">
            <span className="text-gray-500 text-[10px] block">ORIGINAL</span>
            <span className="text-white font-bold text-sm">{originalBytes}</span>
            <span className="text-gray-400 text-[10px] ml-1">bytes</span>
          </div>
          <div className="p-2.5 rounded bg-[#0a0e14] border border-[#1f2937]">
            <span className="text-gray-500 text-[10px] block">COMPRESSED</span>
            <span className="text-cyan-300 font-bold text-sm">{compressedBits}</span>
            <span className="text-gray-400 text-[10px] ml-1">bits ({compressedBytes} B)</span>
          </div>
          <div className="p-2.5 rounded bg-[#0a0e14] border border-[#1f2937]">
            <span className="text-gray-500 text-[10px] block">SPACE SAVINGS</span>
            <span className="text-emerald-400 font-bold text-sm">{spaceSavingsPct}%</span>
            <span className="text-gray-400 text-[10px] ml-1">({ratio.toFixed(2)}x)</span>
          </div>
        </div>

        {/* Compression Ratio Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
            <span>Compression Ratio</span>
            <span className="text-cyan-300 font-semibold">{ratio.toFixed(2)}x of original</span>
          </div>
          <div className="h-2 w-full bg-[#0a0e14] rounded-full overflow-hidden border border-[#1f2937]">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(10, ratio * 100))}%` }}
            />
          </div>
        </div>

        {/* Code Table Preview */}
        <div>
          <span className="text-[11px] font-mono text-gray-400 block mb-2">
            Prefix Code Table (Top Symbols):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[10px]">
            {sampleCodes.map((item, idx) => (
              <div
                key={idx}
                className="p-1.5 rounded bg-[#0a0e14] border border-[#1f2937] flex flex-col justify-between"
              >
                <span className="text-gray-400 truncate">{item.char}</span>
                <span className="text-cyan-400 font-bold mt-0.5">{item.code}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
