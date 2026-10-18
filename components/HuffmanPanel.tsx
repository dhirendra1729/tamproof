"use client";

import React from "react";
import { FileArchive, Binary, AlertCircle } from "lucide-react";
import { EvidenceFile } from "@/lib/types";

interface HuffmanPanelProps {
  selectedFile: EvidenceFile | null;
}

export function HuffmanPanel({ selectedFile }: HuffmanPanelProps) {
  if (!selectedFile) {
    return (
      <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col justify-between h-full select-none">
        <div className="bg-[#E2ECE5] border-b-2 border-[#BDCEBF] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Binary className="w-5 h-5 text-[#5A7D5C]" />
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-[#223326] font-mono">
                Huffman Lossless Compression
              </h2>
              <p className="text-xs text-[#5A6B5E] font-sans font-medium mt-0.5">
                Optimal prefix encoding via priority queue
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#5A6B5E] px-3 py-1 rounded-lg bg-white border border-[#BDCEBF]">
            MinHeap Tree
          </span>
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-10 border-2 border-[#BDCEBF] rounded-xl text-center bg-[#F4F8F5]">
            <AlertCircle className="w-7 h-7 text-[#5A6B5E] mb-2 stroke-[1.5]" />
            <p className="text-base font-mono text-[#223326] font-bold">No Evidence File Selected</p>
            <p className="text-xs font-mono text-[#5A6B5E] mt-1 max-w-sm">
              Select any file from the Evidence Records table above to inspect its real C++ Huffman compression stats.
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
  const spaceSavingsPct =
    originalBytes > 0
      ? Math.max(0, Math.round((1 - compressedBytes / originalBytes) * 100))
      : 0;

  // Real illustrative frequency codes explicitly labelled
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
    <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col justify-between h-full select-none">
      {/* Box Header */}
      <div className="bg-[#E2ECE5] border-b-2 border-[#BDCEBF] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileArchive className="w-5 h-5 text-[#5A7D5C]" />
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-[#223326] font-mono truncate max-w-[280px] sm:max-w-[360px]">
              Huffman: {selectedFile.name}
            </h2>
            <p className="text-xs text-[#5A6B5E] font-sans font-medium mt-0.5">
              Entropy compression calculated in C++ engine
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-[#5A7D5C] px-3 py-1 rounded-lg bg-white border border-[#5A7D5C]">
          MinHeap Priority Queue
        </span>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        {/* Compression Metrics Grid */}
        <div className="grid grid-cols-3 gap-3.5 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#F4F8F5] border-2 border-[#BDCEBF]">
            <span className="text-[#5A6B5E] text-xs block font-sans font-bold uppercase">ORIGINAL</span>
            <span className="text-[#223326] font-bold text-lg">{originalBytes}</span>
            <span className="text-[#5A6B5E] text-xs ml-1">bytes</span>
          </div>
          <div className="p-4 rounded-xl bg-[#EBF3EE] border-2 border-[#5A7D5C]">
            <span className="text-[#5A7D5C] text-xs block font-sans font-bold uppercase">COMPRESSED</span>
            <span className="text-[#223326] font-bold text-lg">{compressedBits}</span>
            <span className="text-[#5A6B5E] text-xs ml-1">bits ({compressedBytes} B)</span>
          </div>
          <div className="p-4 rounded-xl bg-[#FEF3C7] border-2 border-[#C48B47]">
            <span className="text-[#92400E] text-xs block font-sans font-bold uppercase">SAVINGS</span>
            <span className="text-[#C48B47] font-bold text-lg">{spaceSavingsPct}%</span>
            <span className="text-[#92400E] text-xs ml-1">({ratio.toFixed(2)}x)</span>
          </div>
        </div>

        {/* Compression Ratio Bar */}
        <div>
          <div className="flex justify-between text-xs font-mono text-[#5A6B5E] mb-2 font-bold">
            <span>Compression Ratio</span>
            <span className="text-[#5A7D5C]">{ratio.toFixed(2)}x of original size</span>
          </div>
          <div className="h-3.5 w-full bg-[#BDCEBF]/40 rounded-full overflow-hidden border-2 border-[#BDCEBF]">
            <div
              className="h-full bg-[#5A7D5C] transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(10, ratio * 100))}%` }}
            />
          </div>
        </div>

        {/* Code Table Preview (Clearly labelled as illustrative) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono text-[#223326] font-bold uppercase tracking-wider">
              Illustrative Example Codes:
            </span>
            <span className="text-[11px] font-mono text-[#5A6B5E]">English text corpus</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            {sampleCodes.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#F4F8F5] border-2 border-[#BDCEBF] flex flex-col justify-between shadow-sm"
              >
                <span className="text-[#5A6B5E] truncate text-[11px] font-medium">{item.char}</span>
                <span className="text-[#223326] font-bold text-xs mt-1">{item.code}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
