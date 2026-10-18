"use client";

import React, { useState } from "react";
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
    <div className="bg-white border-2 border-[#C48B47] rounded-xl overflow-hidden shadow-cardFrame flex flex-col">
      {/* Box Header */}
      <div className="bg-[#FEF3C7] border-b-2 border-[#C48B47]/40 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#92400E] font-mono">
            Adversary Simulation Lab
          </h2>
          <p className="text-xs text-[#5A6B5E] font-sans mt-0.5 font-medium">
            Secretly modify stored evidence buffers in memory. The vault integrity check will trace and expose violations.
          </p>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-white border border-[#C48B47] text-[#92400E] font-bold self-start sm:self-auto">
          Tamper Simulation Engine
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Scenario 1: Flip a byte in evidence file */}
        <div className="p-5 rounded-lg bg-[#FDFBF7] border-2 border-[#E9DFD3] flex flex-col justify-between shadow-sm">
          <div>
            <div className="text-[#92400E] font-bold text-sm mb-1 uppercase tracking-wide">
              Scenario A: Flip 1 Byte in Stored File
            </div>
            <p className="text-[11px] text-[#5A6B5E] font-sans mb-3.5 leading-relaxed">
              Flips one byte (<code className="text-[#92400E] bg-[#FEF3C7] px-1 py-0.5 rounded font-mono border border-[#C48B47]/30">bytes[i] ^= 0xFF</code>) in C++ memory. The file silently remains marked &ldquo;secured&rdquo; until you run the integrity check!
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-[#223326] font-bold">Target File:</label>
              <select
                value={selectedFileId || files[0]?.id || ""}
                onChange={(e) => setSelectedFileId(e.target.value)}
                disabled={files.length === 0}
                className="w-full bg-white border-2 border-[#BDCEBF] rounded-lg px-3 py-2 text-[#223326] font-bold focus:outline-none focus:border-[#C48B47] disabled:opacity-40 shadow-sm"
              >
                {files.length === 0 ? (
                  <option value="">No files available in vault</option>
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
            className="mt-5 w-full py-2.5 px-4 rounded-lg bg-[#C48B47] hover:bg-[#B37B3A] text-white font-bold font-mono text-xs uppercase tracking-wider disabled:opacity-40 transition-colors shadow-sm"
          >
            Mutate File In Memory
          </button>
        </div>

        {/* Scenario 2: Edit a past audit log entry */}
        <div className="p-5 rounded-lg bg-[#FDFBF7] border-2 border-[#E9DFD3] flex flex-col justify-between shadow-sm">
          <div>
            <div className="text-[#92400E] font-bold text-sm mb-1 uppercase tracking-wide">
              Scenario B: Edit Past Audit Log Entry
            </div>
            <p className="text-[11px] text-[#5A6B5E] font-sans mb-3.5 leading-relaxed">
              Mutates historical details in a block without recomputing hashes. The audit chain will detect link discontinuity at that exact index.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-[#223326] font-bold block mb-1">Target Block:</label>
                <select
                  value={selectedBlockIdx}
                  onChange={(e) => setSelectedBlockIdx(parseInt(e.target.value, 10))}
                  disabled={blocks.length === 0}
                  className="w-full bg-white border-2 border-[#BDCEBF] rounded-lg px-3 py-2 text-[#223326] font-bold focus:outline-none focus:border-[#C48B47] disabled:opacity-40 shadow-sm"
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
                  className="w-full bg-white border-2 border-[#BDCEBF] rounded-lg px-3 py-2 text-[#223326] focus:outline-none focus:border-[#C48B47] text-xs font-mono font-bold shadow-sm"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleTamperBlock}
            disabled={blocks.length === 0}
            className="mt-5 w-full py-2.5 px-4 rounded-lg bg-[#92400E] hover:bg-[#78350F] text-white font-bold font-mono text-xs uppercase tracking-wider disabled:opacity-40 transition-colors shadow-sm"
          >
            Corrupt Audit Block
          </button>
        </div>
      </div>
    </div>
  );
}
