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
import { DemoScriptStepper } from "@/components/DemoScriptStepper";

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

  React.useEffect(() => {
    if (typeof window === "undefined" || !vaultState || vaultState.files.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("autoVerify") === "1" && !verifyResult) {
      runVerify();
    } else if (params.get("autoTamper") === "1" && !verifyResult) {
      (async () => {
        await tamperFile(vaultState.files[0]?.id || "f1");
        await runVerify();
      })();
    } else if (params.get("autoUndo") === "1" && !verifyResult) {
      (async () => {
        await tamperFile(vaultState.files[0]?.id || "f1");
        await runVerify();
        await undo();
      })();
    }
  }, [vaultState, verifyResult, runVerify, tamperFile, undo]);

  const isUndone = Boolean(
    vaultState?.chain &&
      vaultState.chain.length > 0 &&
      vaultState.chain[vaultState.chain.length - 1].action === "UNDO"
  );

  return (
    <div className="min-h-screen bg-[#F2F7F4] text-[#223326] flex flex-col font-sans selection:bg-[#5A7D5C]/20 selection:text-[#223326]">
      {/* Top Forensic Header with Status & Core Undo / Reset */}
      <Header
        vaultState={vaultState}
        verifyResult={verifyResult}
        isIngesting={isIngesting}
        onReset={resetVault}
        onUndo={undo}
      />

      {/* Main Spacious Dashboard Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 sm:px-10 py-7 space-y-10">
        
        {/* ROW 1: THE STAGE (12-col grid)
            - col-span-8: MerkleTreeView (hero) with CTA + root chip
            - col-span-4: AttackerPanel + DemoScriptStepper */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 flex flex-col h-full">
            <MerkleTreeView
              tree={vaultState?.merkleTree || null}
              brokenPath={isUndone ? [] : verifyResult?.brokenPath || []}
              merkleRoot={vaultState?.merkleRoot || ""}
              verifyResult={isUndone ? null : verifyResult}
              isVerifying={isLoading}
              fileCount={vaultState?.files.length || 0}
              onVerify={runVerify}
              onFilesSelected={ingestFiles}
            />
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <AttackerPanel
              files={vaultState?.files || []}
              blocks={vaultState?.chain || []}
              onTamperFile={tamperFile}
              onTamperBlock={tamperBlock}
            />
            <DemoScriptStepper
              vaultState={vaultState}
              verifyResult={verifyResult}
            />
          </div>
        </section>

        {/* ROW 2: EVIDENCE INGESTION & RECORDS (12-col grid)
            - col-span-5: Dropzone
            - col-span-7: EvidenceList */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex flex-col">
            <Dropzone
              onFilesSelected={ingestFiles}
              isIngesting={isIngesting}
            />
          </div>

          <div className="lg:col-span-7 flex flex-col">
            <EvidenceList
              files={vaultState?.files || []}
              selectedFileId={selectedFile?.id || null}
              onSelectFile={selectFile}
              onFlagUrgent={flagUrgent}
            />
          </div>
        </section>

        {/* ROW 3: VERIFICATION VERDICT CARD (Result area only) */}
        {verifyResult && !isUndone && (
          <section>
            <VerifyButton
              verifyResult={verifyResult}
              fileCount={vaultState?.files.length || 0}
            />
          </section>
        )}

        {/* ROW 4: CRYPTOGRAPHIC AUDIT CHAIN (Full Width) */}
        <section>
          <HashChainView
            blocks={vaultState?.chain || []}
            brokenAt={verifyResult?.brokenAt ?? -1}
            chainValid={vaultState?.chainValid ?? true}
          />
        </section>

        {/* ROW 5: DEEP DATA STRUCTURE MECHANICS (6 + 6 Columns) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <HashTableView buckets={vaultState?.buckets || []} />
          <HuffmanPanel selectedFile={selectedFile} />
        </section>

        {/* ROW 6: DATA STRUCTURE INSPECTOR (Full Width 3-Column Strip) */}
        <section>
          <DSInspector
            stack={vaultState?.stack || []}
            queue={vaultState?.queue || []}
            urgentHeap={vaultState?.urgentHeap || []}
            onProcessUrgent={processUrgent}
          />
        </section>
      </main>

      {/* Clean Forensic Footer */}
      <footer className="border-t-2 border-[#4A6150]/30 bg-white py-6 px-6 text-center text-xs font-mono text-[#5A6B5E]">
        Tamper-Proof Evidence Vault • C++17 Forensic Core &amp; Next.js Simulation Layer • AIT Pune Data Structures
      </footer>
    </div>
  );
}
