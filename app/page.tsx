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
    <div className="min-h-screen bg-[#F2F7F4] text-[#223326] flex flex-col font-sans selection:bg-[#5A7D5C]/20 selection:text-[#223326]">
      {/* 1. Header with Live Status & Merkle Root */}
      <Header
        vaultState={vaultState}
        verifyResult={verifyResult}
        isIngesting={isIngesting}
        onReset={resetVault}
        onUndo={undo}
      />

      {/* Main Spacious Dashboard Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Verification Command Bar */}
        <section>
          <VerifyButton
            onVerify={runVerify}
            isLoading={isLoading}
            verifyResult={verifyResult}
            fileCount={vaultState?.files.length || 0}
          />
        </section>

        {/* SECTION 1: INGESTION & EVIDENCE RECORDS (Spacious 2-Column Grid) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Dropzone (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <Dropzone
              onFilesSelected={ingestFiles}
              isIngesting={isIngesting}
            />
          </div>

          {/* Right: Evidence Records Table (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <EvidenceList
              files={vaultState?.files || []}
              selectedFileId={selectedFile?.id || null}
              onSelectFile={selectFile}
              onFlagUrgent={flagUrgent}
            />
          </div>
        </section>

        {/* SECTION 2: MERKLE TREE COMMITMENT & DS INSPECTOR (Spacious 8 + 4 Grid) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Center-Left Hero: Merkle Tree Visualizer (8 cols) */}
          <div className="lg:col-span-8 flex flex-col">
            <MerkleTreeView
              tree={vaultState?.merkleTree || null}
              brokenPath={verifyResult?.brokenPath || []}
              merkleRoot={vaultState?.merkleRoot || ""}
            />
          </div>

          {/* Right: Data Structure Inspector (4 cols) */}
          <div className="lg:col-span-4 flex flex-col">
            <DSInspector
              stack={vaultState?.stack || []}
              queue={vaultState?.queue || []}
              urgentHeap={vaultState?.urgentHeap || []}
              onProcessUrgent={processUrgent}
            />
          </div>
        </section>

        {/* SECTION 3: AUDIT LEDGER */}
        <section>
          <HashChainView
            blocks={vaultState?.chain || []}
            brokenAt={verifyResult?.brokenAt ?? -1}
            chainValid={vaultState?.chainValid ?? true}
          />
        </section>

        {/* SECTION 4: DEEP DATA STRUCTURE MECHANICS (Equal 6 + 6 Columns) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <HashTableView buckets={vaultState?.buckets || []} />
          <HuffmanPanel selectedFile={selectedFile} />
        </section>

        {/* SECTION 5: ADVERSARIAL SIMULATION LAB */}
        <section>
          <AttackerPanel
            files={vaultState?.files || []}
            blocks={vaultState?.chain || []}
            onTamperFile={tamperFile}
            onTamperBlock={tamperBlock}
          />
        </section>
      </main>

      {/* Clean Light Footer */}
      <footer className="border-t-2 border-[#4A6150]/30 bg-white py-5 px-6 text-center text-xs font-mono text-[#5A6B5E]">
        Tamper-Proof Evidence Vault • C++17 Forensic Core &amp; Next.js Simulation Layer • AIT Pune Data Structures
      </footer>
    </div>
  );
}
