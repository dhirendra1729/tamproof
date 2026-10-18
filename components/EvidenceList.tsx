"use client";

import React from "react";
import { FileCode, AlertTriangle, CheckCircle2, Zap, Copy } from "lucide-react";
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
    <div className="bg-[#11161f] border border-[#1f2937] rounded-lg p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-200 font-mono">
            Evidence Records ({files.length})
          </h2>
        </div>
        <span className="text-xs text-gray-500 font-mono">Indexed by FNV-1a HashTable</span>
      </div>

      {files.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-[#1f2937] rounded-lg text-center">
          <FileCode className="w-8 h-8 text-gray-600 mb-2" />
          <p className="text-sm font-mono text-gray-400">Vault currently empty</p>
          <p className="text-xs font-mono text-gray-500 mt-1">
            Drop files above or click &ldquo;Load Sample Evidence&rdquo; to begin.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-auto max-h-[360px] custom-scrollbar border border-[#1f2937] rounded-md">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0a0e14] text-gray-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-[#1f2937]">
              <tr>
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">SHA-256 Fingerprint</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Ratio</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {files.map((file) => {
                const isSelected = file.id === selectedFileId;
                const isTampered = file.status === "tampered";
                const truncHash = `${file.storedHash.slice(0, 6)}...${file.storedHash.slice(-6)}`;

                return (
                  <tr
                    key={file.id}
                    onClick={() => onSelectFile(file.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-cyan-950/40 border-l-2 border-l-cyan-400"
                        : "hover:bg-[#151c27]"
                    } ${isTampered ? "bg-red-950/30 text-red-200" : ""}`}
                  >
                    <td className="py-2.5 px-3 font-bold text-gray-300">
                      {file.id}
                    </td>
                    <td className="py-2.5 px-3 text-white font-medium truncate max-w-[140px]" title={file.name}>
                      {file.name}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-cyan-300/90 font-mono" title={file.storedHash}>
                          {truncHash}
                        </span>
                        <button
                          onClick={(e) => copyHash(file.storedHash, e)}
                          className="text-gray-500 hover:text-cyan-400 transition-colors"
                          title="Copy full 64-char hex hash"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {copiedHash === file.storedHash && (
                          <span className="text-[10px] text-emerald-400">copied</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-gray-400">
                      {file.size} B
                    </td>
                    <td className="py-2.5 px-3 text-gray-300">
                      <span className="px-1.5 py-0.5 rounded bg-[#0a0e14] border border-[#1f2937]">
                        {file.compressionRatio.toFixed(2)}x
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {isTampered ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/80 border border-red-500 text-red-300 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          TAMPERED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/50 border border-emerald-500/40 text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          SECURED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFlagUrgent(file.id);
                        }}
                        className="px-2 py-1 rounded bg-[#0a0e14] hover:bg-amber-950/40 border border-[#1f2937] hover:border-amber-500/50 text-[10px] text-amber-400 inline-flex items-center gap-1 transition-colors"
                        title="Flag as urgent (inserts into MinHeap priority queue)"
                      >
                        <Zap className="w-3 h-3" />
                        Urgent
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
  );
}
