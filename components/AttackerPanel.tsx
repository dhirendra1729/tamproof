"use client";

import React, { useState } from "react";
import { AlertTriangle, Edit3, ShieldAlert } from "lucide-react";
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
    <div className="bg-white border-2 border-[#C48B47] rounded-xl overflow-hidden shadow-cardFrame flex flex-col justify-between select-none">
      {/* Box Header */}
      <div className="bg-[#FEF3C7] border-b-2 border-[#C48B47]/40 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#C48B47]" />
          <div>
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#92400E] font-mono">
              Adversary Simulation
            </h2>
            <p className="text-[11px] text-[#5A6B5E] font-sans font-medium">
              Secretly modify stored data in C++ memory
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold text-[#92400E] px-2.5 py-0.5 rounded bg-white border border-[#C48B47]">
          Live Injection
        </span>
      </div>

      <div className="p-4 space-y-3.5">
        {/* Scenario A: Flip One Byte in Stored File */}
        <div className="p-3.5 rounded-xl bg-[#FDFBF7] border-2 border-[#E9DFD3] flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-1.5 text-[#92400E] font-bold text-xs mb-1 font-mono uppercase">
              <AlertTriangle className="w-3.5 h-3.5 text-[#C48B47]" />
              <span>Scenario A: Flip 1 Byte in Memory</span>
            </div>
            <p className="text-[11px] text-[#5A6B5E] font-sans mb-2 leading-relaxed">
              Silently flips a single byte (<code className="text-[#92400E] bg-[#FEF3C7] px-1 py-0.5 rounded font-mono border border-[#C48B47]/30">bytes[idx] ^= 0xFF</code>) in C++ memory. Status remains quietly secured until the audit runs!
            </p>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#223326] font-bold font-mono">Target File:</label>
              <select
                value={selectedFileId || files[0]?.id || ""}
                onChange={(e) => setSelectedFileId(e.target.value)}
                disabled={files.length === 0}
                className="w-full bg-white border-2 border-[#BDCEBF] rounded-lg px-3 py-1.5 text-[#223326] font-mono text-xs font-bold focus:outline-none focus:border-[#C48B47] disabled:opacity-40 shadow-xs"
              >
                {files.length === 0 ? (
                  <option value="">No evidence files loaded</option>
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
            className="mt-2.5 w-full py-2 px-3.5 rounded-lg bg-[#C48B47] hover:bg-[#B37B3A] text-white font-mono font-bold text-xs uppercase tracking-wider disabled:opacity-40 transition-colors shadow-xs"
          >
            Flip Byte In Memory
          </button>
        </div>

        {/* Scenario B: Edit a Past Audit Log Entry */}
        <div className="p-3.5 rounded-xl bg-[#FDFBF7] border-2 border-[#E9DFD3] flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-1.5 text-[#92400E] font-bold text-xs mb-1 font-mono uppercase">
              <Edit3 className="w-3.5 h-3.5 text-[#C48B47]" />
              <span>Scenario B: Modify Past Audit Block</span>
            </div>
            <p className="text-[11px] text-[#5A6B5E] font-sans mb-2 leading-relaxed">
              Mutates historical details in a ledger block without recomputing hashes. The audit chain will detect link discontinuity at that exact block.
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div>
                <label className="text-[11px] text-[#223326] font-bold block mb-1">Target Block:</label>
                <select
                  value={selectedBlockIdx}
                  onChange={(e) => setSelectedBlockIdx(parseInt(e.target.value, 10))}
                  disabled={blocks.length === 0}
                  className="w-full bg-white border-2 border-[#BDCEBF] rounded-lg px-3 py-1.5 text-[#223326] font-bold focus:outline-none focus:border-[#C48B47] disabled:opacity-40 shadow-xs text-xs"
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
                <label className="text-[11px] text-[#223326] font-bold block mb-1">Forged Details:</label>
                <input
                  type="text"
                  value={newBlockDetails}
                  onChange={(e) => setNewBlockDetails(e.target.value)}
                  className="w-full bg-white border-2 border-[#BDCEBF] rounded-lg px-3 py-1.5 text-[#223326] focus:outline-none focus:border-[#C48B47] text-xs font-mono font-bold shadow-xs"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleTamperBlock}
            disabled={blocks.length === 0}
            className="mt-2.5 w-full py-2 px-3.5 rounded-lg bg-[#92400E] hover:bg-[#78350F] text-white font-mono font-bold text-xs uppercase tracking-wider disabled:opacity-40 transition-colors shadow-xs"
          >
            Corrupt Audit Block
          </button>
        </div>
      </div>
    </div>
  );
}
