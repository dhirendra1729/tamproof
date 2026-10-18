"use client";

import React from "react";
import { EvidenceFile } from "@/lib/types";

interface EvidenceListProps {
  files: EvidenceFile[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onFlagUrgent: (fileId: string) => void;
}

export function EvidenceList({
  files,
  selectedFileId,
  onSelectFile,
  onFlagUrgent,
}: EvidenceListProps) {
  const [copiedHash, setCopiedHash] = React.useState<string | null>(null);

  const copyHash = (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  return (
    <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col h-full">
      {/* Box Header Bar */}
      <div className="bg-[#E2ECE5] border-b-2 border-[#4A6150]/30 px-5 py-3.5 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#223326] font-mono">
          Evidence Records ({files.length})
        </h2>
        <span className="text-xs text-[#5A6B5E] font-mono font-bold px-2 py-0.5 rounded bg-white border border-[#BDCEBF]">
          FNV-1a Hash Table
        </span>
      </div>

      {/* Box Body */}
      <div className="p-5 flex-1 flex flex-col justify-center">
        {files.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#BDCEBF] rounded-lg text-center bg-[#F4F8F5]">
            <p className="text-sm font-mono text-[#223326] font-bold">Vault Currently Empty</p>
            <p className="text-xs font-mono text-[#5A6B5E] mt-1">
              Drop files or click &ldquo;Load Sample Evidence&rdquo; to begin ingestion.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[360px] custom-scrollbar border-2 border-[#BDCEBF] rounded-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#E2ECE5] text-[#223326] uppercase text-[10px] font-bold tracking-wider sticky top-0 z-10 border-b-2 border-[#BDCEBF]">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">SHA-256 Fingerprint</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Ratio</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#BDCEBF]/60 bg-white">
                {files.map((file) => {
                  const isSelected = file.id === selectedFileId;
                  const isTampered = file.status === "tampered";
                  const truncHash = `${file.storedHash.slice(0, 8)}...${file.storedHash.slice(-8)}`;

                  return (
                    <tr
                      key={file.id}
                      onClick={() => onSelectFile(file.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#EBF3EE] border-l-4 border-l-[#223326]"
                          : "hover:bg-[#F4F8F5]"
                      } ${isTampered ? "bg-[#FDF2F2] text-[#B91C1C]" : ""}`}
                    >
                      <td className="py-2.5 px-3 font-bold text-[#223326]">
                        {file.id}
                      </td>
                      <td className="py-2.5 px-3 text-[#223326] font-bold truncate max-w-[140px]" title={file.name}>
                        {file.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#223326] font-mono font-bold" title={file.storedHash}>
                            {truncHash}
                          </span>
                          <button
                            onClick={(e) => copyHash(file.storedHash, e)}
                            className="px-1.5 py-0.5 rounded border border-[#BDCEBF] bg-white hover:bg-[#EBF3EE] text-[9px] text-[#5A6B5E] font-sans font-bold"
                            title="Copy full 64-char hex hash"
                          >
                            {copiedHash === file.storedHash ? "copied" : "copy"}
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-[#5A6B5E] font-medium">
                        {file.size} B
                      </td>
                      <td className="py-2.5 px-3 text-[#223326]">
                        <span className="px-1.5 py-0.5 rounded bg-[#F4F8F5] border border-[#BDCEBF] font-bold">
                          {file.compressionRatio.toFixed(2)}x
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {isTampered ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEE2E2] border-2 border-[#D9383A] text-[#D9383A] animate-pulse">
                            [TAMPERED]
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF3EE] border-2 border-[#5A7D5C] text-[#5A7D5C]">
                            [SECURED]
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFlagUrgent(file.id);
                          }}
                          className="px-2.5 py-1 rounded border-2 border-[#C48B47] bg-[#FEF3C7] hover:bg-[#FDE68A] text-[10px] font-mono font-bold text-[#92400E] transition-colors shadow-sm"
                          title="Flag urgent into MinHeap priority queue"
                        >
                          + Urgent
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
