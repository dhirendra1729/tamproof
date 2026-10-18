"use client";

import React from "react";
import { EvidenceFile } from "@/lib/types";

interface HuffmanPanelProps {
  selectedFile: EvidenceFile | null;
}

export function HuffmanPanel({ selectedFile }: HuffmanPanelProps) {
  if (!selectedFile) {
    return (
      <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col justify-between h-full">
        <div className="bg-[#E2ECE5] border-b-2 border-[#4A6150]/30 px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#223326] font-mono">
            Huffman Lossless Compression
          </h2>
          <span className="text-[11px] font-mono font-bold text-[#5A6B5E] px-2 py-0.5 rounded bg-white border border-[#BDCEBF]">
            MinHeap Tree
          </span>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#BDCEBF] rounded-lg text-center bg-[#F4F8F5]">
            <p className="text-sm font-mono text-[#223326] font-bold">No File Selected</p>
            <p className="text-xs font-mono text-[#5A6B5E] mt-1">
              Select an evidence file from the records table to inspect its Huffman binary tree encoding.
            </p>
          </div>
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
    <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col justify-between h-full">
      {/* Box Header */}
      <div className="bg-[#E2ECE5] border-b-2 border-[#4A6150]/30 px-5 py-3.5 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#223326] font-mono truncate max-w-[320px]">
          Huffman: {selectedFile.name}
        </h2>
        <span className="text-[11px] font-mono font-bold text-[#5A7D5C] px-2.5 py-0.5 rounded bg-white border border-[#5A7D5C]">
          MinHeap Priority Queue
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Compression Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-lg bg-[#F4F8F5] border-2 border-[#BDCEBF]">
            <span className="text-[#5A6B5E] text-[10px] block font-sans font-bold uppercase">ORIGINAL</span>
            <span className="text-[#223326] font-bold text-base">{originalBytes}</span>
            <span className="text-[#5A6B5E] text-[10px] ml-1">bytes</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#EBF3EE] border-2 border-[#5A7D5C]">
            <span className="text-[#5A7D5C] text-[10px] block font-sans font-bold uppercase">COMPRESSED</span>
            <span className="text-[#223326] font-bold text-base">{compressedBits}</span>
            <span className="text-[#5A6B5E] text-[10px] ml-1">bits ({compressedBytes} B)</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#FEF3C7] border-2 border-[#C48B47]">
            <span className="text-[#92400E] text-[10px] block font-sans font-bold uppercase">SPACE SAVINGS</span>
            <span className="text-[#C48B47] font-bold text-base">{spaceSavingsPct}%</span>
            <span className="text-[#92400E] text-[10px] ml-1">({ratio.toFixed(2)}x)</span>
          </div>
        </div>

        {/* Compression Ratio Bar */}
        <div>
          <div className="flex justify-between text-xs font-mono text-[#5A6B5E] mb-1.5 font-bold">
            <span>Compression Ratio</span>
            <span className="text-[#5A7D5C]">{ratio.toFixed(2)}x of original</span>
          </div>
          <div className="h-3 w-full bg-[#BDCEBF]/40 rounded-full overflow-hidden border-2 border-[#BDCEBF]">
            <div
              className="h-full bg-[#5A7D5C] transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(10, ratio * 100))}%` }}
            />
          </div>
        </div>

        {/* Code Table Preview */}
        <div>
          <span className="text-xs font-mono text-[#223326] block mb-2 font-bold uppercase tracking-wider">
            Prefix Code Table (Top Symbols):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
            {sampleCodes.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#F4F8F5] border-2 border-[#BDCEBF] flex flex-col justify-between shadow-sm"
              >
                <span className="text-[#5A6B5E] truncate font-medium">{item.char}</span>
                <span className="text-[#223326] font-bold text-xs mt-1">{item.code}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
