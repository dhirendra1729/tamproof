"use client";

import React from "react";
import { Check } from "lucide-react";
import { VaultState, VerifyResult } from "@/lib/types";

interface DemoScriptStepperProps {
  vaultState: VaultState | null;
  verifyResult: VerifyResult | null;
}

export function DemoScriptStepper({
  vaultState,
  verifyResult,
}: DemoScriptStepperProps) {
  const fileCount = vaultState?.files.length ?? 0;
  const isTamperedDetected = Boolean(
    verifyResult &&
      (verifyResult.tampered.length > 0 ||
        !verifyResult.chainValid ||
        (verifyResult.rootBefore !== verifyResult.rootAfter && fileCount > 0))
  );

  const hasTamperRecorded = Boolean(
    vaultState?.files.some((f) => f.status === "tampered") ||
      vaultState?.chainValid === false ||
      vaultState?.stack.some((s) => s.toUpperCase().includes("TAMPER")) ||
      vaultState?.chain.some(
        (b) =>
          b.action.toUpperCase().includes("TAMPER") ||
          b.action.includes("FAILED") ||
          b.action === "REPLACE"
      )
  );

  const isUndone = Boolean(
    vaultState?.chain &&
      vaultState.chain.length > 0 &&
      vaultState.chain.some((b) => b.action === "UNDO")
  );

  const step1Done = fileCount > 0;
  const step2Done = step1Done && (isUndone || (verifyResult !== null && !isTamperedDetected && !hasTamperRecorded));
  const step3Done = isUndone || hasTamperRecorded || isTamperedDetected;
  const step4Done = isUndone || isTamperedDetected;
  const step5Done = isUndone;
  const step5Active = isTamperedDetected && !isUndone;

  let currentStep = 1;
  if (isUndone) {
    currentStep = 5;
  } else if (!step1Done) {
    currentStep = 1;
  } else if (!verifyResult && !hasTamperRecorded) {
    currentStep = 2;
  } else if (step2Done && !hasTamperRecorded) {
    currentStep = 3;
  } else if (hasTamperRecorded && !isTamperedDetected) {
    currentStep = 4;
  } else if (isTamperedDetected) {
    currentStep = 5;
  }

  const steps = [
    { num: 1, label: "1. Ingest Evidence", isDone: step1Done },
    { num: 2, label: "2. Verify (Green)", isDone: step2Done },
    { num: 3, label: "3. Attacker Strikes", isDone: step3Done },
    { num: 4, label: "4. Verify (Red)", isDone: step4Done },
    { num: 5, label: "5. Undo Recovery", isDone: step5Done, isActive: step5Active },
  ];

  return (
    <div className="bg-white border-2 border-[#4A6150] rounded-xl p-3.5 sm:p-4 shadow-cardFrame">
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b-2 border-[#BDCEBF]">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#223326]">
          Demo Script Checklist
        </span>
        <span className="text-xs font-mono text-[#5A7D5C] font-bold bg-[#EBF3EE] px-2.5 py-0.5 rounded border border-[#5A7D5C]/40">
          {isUndone ? "Demo Complete" : `Step ${currentStep} of 5`}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
        {steps.map((s) => {
          const isCurrent = s.num === currentStep;
          return (
            <div
              key={s.num}
              className={`p-1.5 sm:p-2 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                s.isDone
                  ? "bg-[#EBF3EE] border-[#5A7D5C] text-[#223326]"
                  : isCurrent
                  ? "bg-[#FEF3C7] border-[#C48B47] text-[#92400E] ring-2 ring-[#C48B47]/50 ring-offset-1 font-bold"
                  : "bg-[#F4F8F5] border-[#BDCEBF] text-[#5A6B5E] opacity-75"
              }`}
            >
              <div className="flex items-center justify-center w-5 h-5 rounded-full mb-0.5 text-xs font-bold">
                {s.isDone ? (
                  <Check className="w-3.5 h-3.5 text-[#5A7D5C] stroke-[3]" />
                ) : (
                  <span>{s.num}</span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase truncate max-w-full leading-tight">
                {s.label.split(". ")[1]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
