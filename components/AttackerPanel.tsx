"use client";

import React, { useState } from "react";
import { Skull, AlertTriangle, FileWarning, Edit3 } from "lucide-react";
import { EvidenceFile, ChainBlock } from "@/lib/types";

interface AttackerPanelProps {
  files: EvidenceFile[];
  blocks: ChainBlock[];
  onTamperFile: (fileId: string) => void;
  onTamperBlock: (index: number, details: string) => void;
}

export function AttackerPanel({
  files,
  blocks,
  onTamperFile,
  onTamperBlock,
}: AttackerPanelProps) {
  const [selectedFileId, setSelectedFileId] = useState<string>("");
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number>(0);
  const [newBlockDetails, setNewBlockDetails] = useState<string>("UNAUTHORIZED ADVERSARY MODIFICATION");

  const handleTamperFile = () => {
    const idToTamper = selectedFileId || files[0]?.id;
    if (!idToTamper) {
      alert("No files available to tamper");
      return;
    }
    onTamperFile(idToTamper);
  };

  const handleTamperBlock = () => {
    if (blocks.length === 0) {
      alert("No blocks in audit chain to tamper");
      return;
    }
    onTamperBlock(selectedBlockIdx, newBlockDetails);
  };

  return (
    <div className="bg-[#11161f] border-2 border-amber-500/60 rounded-lg p-5 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#1f2937]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-amber-950/60 border border-amber-500/50 text-amber-400">
            <Skull className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-amber-400 font-mono">
              Attacker Mode (simulation)
            </h2>
            <p className="text-xs text-gray-300 font-mono mt-0.5">
              Secretly modify stored evidence. The vault should catch it. Try it.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300">
          Adversarial Testbed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
        {/* Scenario 1: Flip a byte in evidence file */}
        <div className="p-4 rounded-lg bg-[#0a0e14] border border-[#1f2937] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-300 font-bold mb-1.5">
              <FileWarning className="w-4 h-4 text-amber-400" />
              Scenario A: Flip One Byte in Stored File
            </div>
            <p className="text-[11px] text-gray-400 mb-3">
              Flips one byte (<code className="text-amber-400">bytes[i] ^= 0xFF</code>) in the C++ memory buffer. The file still shows &ldquo;secured&rdquo; until you run the integrity check!
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] text-gray-400">Target File:</label>
              <select
                value={selectedFileId || files[0]?.id || ""}
                onChange={(e) => setSelectedFileId(e.target.value)}
                disabled={files.length === 0}
                className="w-full bg-[#11161f] border border-[#1f2937] rounded px-3 py-2 text-gray-200 focus:outline-none focus:border-amber-500 disabled:opacity-40"
              >
                {files.length === 0 ? (
                  <option value="">No files available</option>
                ) : (
                  files.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.id}: {f.name} ({f.size} B)
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <button
            onClick={handleTamperFile}
            disabled={files.length === 0}
            className="mt-4 w-full py-2 px-4 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-colors shadow-md"
          >
            <AlertTriangle className="w-4 h-4" />
            Flip 1 Byte (Silent Mutation)
          </button>
        </div>

        {/* Scenario 2: Edit a past audit log entry */}
        <div className="p-4 rounded-lg bg-[#0a0e14] border border-[#1f2937] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-300 font-bold mb-1.5">
              <Edit3 className="w-4 h-4 text-amber-400" />
              Scenario B: Edit a Past Audit Log Entry
            </div>
            <p className="text-[11px] text-gray-400 mb-3">
              Mutates historical details in a block without recomputing hashes. The audit chain will detect link discontinuity at that exact index.
            </p>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Target Block:</label>
                <select
                  value={selectedBlockIdx}
                  onChange={(e) => setSelectedBlockIdx(parseInt(e.target.value, 10))}
                  disabled={blocks.length === 0}
                  className="w-full bg-[#11161f] border border-[#1f2937] rounded px-3 py-2 text-gray-200 focus:outline-none focus:border-amber-500 disabled:opacity-40"
                >
                  {blocks.length === 0 ? (
                    <option value="0">No blocks available</option>
                  ) : (
                    blocks.map((b) => (
                      <option key={b.index} value={b.index}>
                        Block #{b.index}: [{b.action}] {b.details}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Forged Details:</label>
                <input
                  type="text"
                  value={newBlockDetails}
                  onChange={(e) => setNewBlockDetails(e.target.value)}
                  className="w-full bg-[#11161f] border border-[#1f2937] rounded px-3 py-2 text-gray-200 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleTamperBlock}
            disabled={blocks.length === 0}
            className="mt-4 w-full py-2 px-4 rounded bg-amber-600/90 hover:bg-amber-500 text-black font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-colors shadow-md"
          >
            <Skull className="w-4 h-4" />
            Corrupt Audit Block
          </button>
        </div>
      </div>
    </div>
  );
}
