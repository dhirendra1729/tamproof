"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, AlertCircle, FileText, PlusCircle } from "lucide-react";
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
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyHash = (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  return (
    <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col h-full select-none">
      {/* Box Header Bar */}
      <div className="bg-[#E2ECE5] border-b-2 border-[#BDCEBF] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-[#5A7D5C]" />
          <h2 className="text-base font-bold uppercase tracking-wider text-[#223326] font-mono">
            Evidence Records ({files.length})
          </h2>
        </div>
        <span className="text-xs text-[#5A6B5E] font-mono font-bold px-3 py-1 rounded-lg bg-white border border-[#BDCEBF]">
          FNV-1a Hash Table
        </span>
      </div>

      {/* Box Body */}
      <div className="p-6 flex-1 flex flex-col justify-center">
        {files.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 border-2 border-[#BDCEBF] rounded-xl text-center bg-[#F4F8F5]">
            <AlertCircle className="w-8 h-8 text-[#5A6B5E] mb-2 stroke-[1.5]" />
            <p className="text-base font-mono text-[#223326] font-bold">Vault Currently Empty</p>
            <p className="text-xs font-mono text-[#5A6B5E] mt-1 max-w-sm">
              Drop files on the dropzone or load sample evidence to populate custody records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[380px] custom-scrollbar border-2 border-[#BDCEBF] rounded-xl">
            <table className="w-full text-left font-mono">
              <thead className="bg-[#E2ECE5] text-[#223326] uppercase text-xs font-bold tracking-wider sticky top-0 z-10 border-b-2 border-[#BDCEBF]">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">SHA-256 Digest</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Ratio</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#BDCEBF]/60 bg-white text-xs sm:text-[13px]">
                <AnimatePresence initial={false}>
                  {files.map((file) => {
                    const isSelected = file.id === selectedFileId;
                    const isTampered = file.status === "tampered";
                    const truncHash = `${file.storedHash.slice(0, 8)}...${file.storedHash.slice(-8)}`;

                    return (
                      <motion.tr
                        key={file.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => onSelectFile(file.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#EBF3EE] border-l-4 border-l-[#223326]"
                            : "hover:bg-[#F4F8F5]"
                        } ${isTampered ? "bg-[#FDF2F2] text-[#B91C1C]" : ""}`}
                      >
                        <td className="py-3.5 px-4 font-bold text-[#223326]">
                          {file.id}
                        </td>
                        <td className="py-3.5 px-4 text-[#223326] font-bold truncate max-w-[150px]" title={file.name}>
                          {file.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[#223326] font-mono font-bold text-xs" title={file.storedHash}>
                              {truncHash}
                            </span>
                            <button
                              onClick={(e) => copyHash(file.storedHash, e)}
                              className="px-2 py-1 rounded border border-[#BDCEBF] bg-white hover:bg-[#EBF3EE] text-[10px] text-[#5A6B5E] font-sans font-bold flex items-center gap-1 shadow-xs"
                              title="Copy full 64-char hex hash"
                            >
                              {copiedHash === file.storedHash ? (
                                <>
                                  <Check className="w-3 h-3 text-[#5A7D5C]" />
                                  <span>copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-[#5A6B5E]" />
                                  <span>copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#5A6B5E] font-medium">
                          {file.size} B
                        </td>
                        <td className="py-3.5 px-4 text-[#223326]">
                          <span className="px-2 py-0.5 rounded bg-[#F4F8F5] border border-[#BDCEBF] font-bold text-xs">
                            {file.compressionRatio.toFixed(2)}x
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {isTampered ? (
                            <span className="inline-block px-2.5 py-1 rounded text-xs font-bold bg-[#FEE2E2] border-2 border-[#D9383A] text-[#D9383A] animate-pulse">
                              [TAMPERED]
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded text-xs font-bold bg-[#EBF3EE] border-2 border-[#5A7D5C] text-[#5A7D5C]">
                              [SECURED]
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onFlagUrgent(file.id);
                            }}
                            className="px-3 py-1.5 rounded-lg border-2 border-[#C48B47] bg-[#FEF3C7] hover:bg-[#FDE68A] text-xs font-mono font-bold text-[#92400E] transition-colors shadow-sm inline-flex items-center gap-1"
                            title="Flag urgent into MinHeap priority queue"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>Urgent</span>
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
