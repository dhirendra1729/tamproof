"use client";

import React from "react";
import { useVault } from "@/lib/useVault";
import { Header } from "@/components/Header";
import { Dropzone } from "@/components/Dropzone";
import { EvidenceList } from "@/components/EvidenceList";
import { MerkleTreeView } from "@/components/MerkleTreeView";
import { HashChainView } from "@/components/HashChainView";
import { HashTableView } from "@/components/HashTableView";
import { HuffmanPanel } from "@/components/HuffmanPanel";
import { AttackerPanel } from "@/components/AttackerPanel";
import { DSInspector } from "@/components/DSInspector";
import { VerifyButton } from "@/components/VerifyButton";

export default function ForensicVaultDashboard() {
  const {
    vaultState,
    verifyResult,
    isLoading,
    isIngesting,
    selectedFileId,
    selectFile,
    ingestFiles,
    runVerify,
    tamperFile,
    tamperBlock,
    undo,
    flagUrgent,
    processUrgent,
    resetVault,
  } = useVault();

  const selectedFile =
    vaultState?.files.find((f) => f.id === selectedFileId) ||
    vaultState?.files[0] ||
    null;

  return (
    <div className="min-h-screen bg-[#0a0e14] text-[#e5e7eb] flex flex-col font-sans">
      {/* 1. Header with Live Status & Merkle Root */}
      <Header
        vaultState={vaultState}
        verifyResult={verifyResult}
        isIngesting={isIngesting}
        onReset={resetVault}
        onUndo={undo}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Verification Trigger Banner */}
        <VerifyButton
          onVerify={runVerify}
          isLoading={isLoading}
          verifyResult={verifyResult}
          fileCount={vaultState?.files.length || 0}
        />

        {/* Row 1: Dropzone + Evidence List (Left), Merkle Tree Hero (Center 55%), DS Inspector (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column (3.5 cols): Dropzone + Evidence Records */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Dropzone
              onFilesSelected={ingestFiles}
              isIngesting={isIngesting}
            />
            <div className="flex-1">
              <EvidenceList
                files={vaultState?.files || []}
                selectedFileId={selectedFile?.id || null}
                onSelectFile={selectFile}
                onFlagUrgent={flagUrgent}
              />
            </div>
          </div>

          {/* Center Column (5.5 cols): Hero Merkle Tree View */}
          <div className="lg:col-span-5 flex flex-col">
            <MerkleTreeView
              tree={vaultState?.merkleTree || null}
              brokenPath={verifyResult?.brokenPath || []}
              merkleRoot={vaultState?.merkleRoot || ""}
            />
          </div>

          {/* Right Column (2.5 cols): DS Inspector */}
          <div className="lg:col-span-3 flex flex-col">
            <DSInspector
              stack={vaultState?.stack || []}
              queue={vaultState?.queue || []}
              urgentHeap={vaultState?.urgentHeap || []}
              onProcessUrgent={processUrgent}
            />
          </div>
        </div>

        {/* Row 2: HashChain Timeline */}
        <HashChainView
          blocks={vaultState?.chain || []}
          brokenAt={verifyResult?.brokenAt ?? -1}
          chainValid={vaultState?.chainValid ?? true}
        />

        {/* Row 3: HashTableView (50%) + HuffmanPanel (50%) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <HashTableView buckets={vaultState?.buckets || []} />
          <HuffmanPanel selectedFile={selectedFile} />
        </div>

        {/* Row 4: AttackerPanel (Simulation Mode) */}
        <AttackerPanel
          files={vaultState?.files || []}
          blocks={vaultState?.chain || []}
          onTamperFile={tamperFile}
          onTamperBlock={tamperBlock}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f2937] bg-[#11161f]/60 py-4 px-6 text-center text-xs font-mono text-gray-500">
        Tamper-Proof Evidence Vault • Built with C++17 Core Engine & Next.js Simulation Layer • AIT Pune Data Structures
      </footer>
    </div>
  );
}
