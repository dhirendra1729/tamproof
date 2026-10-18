"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FolderPlus, ArrowUpCircle } from "lucide-react";
import { fileToBase64, loadSampleEvidenceFiles } from "./sampleLoader";

interface DropzoneProps {
  onFilesSelected: (files: { name: string; base64: string }[]) => void;
  isIngesting: boolean;
}

export function Dropzone({ onFilesSelected, isIngesting }: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files: { name: string; base64: string }[] = [];

    for (let i = 0; i < fileList.length; ++i) {
      const f = fileList[i];
      if (f.size > 1024 * 1024) {
        alert(`File ${f.name} exceeds 1 MB limit`);
        continue;
      }
      const b64 = await fileToBase64(f);
      files.push({ name: f.name, base64: b64 });
    }

    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleLoadSamples = async () => {
    try {
      setIsLoadingSamples(true);
      const loadedFiles = await loadSampleEvidenceFiles();
      if (loadedFiles.length > 0) {
        onFilesSelected(loadedFiles);
      }
    } catch (err) {
      console.error("Failed to load sample evidence:", err);
      alert("Failed to load sample evidence files");
    } finally {
      setIsLoadingSamples(false);
    }
  };

  return (
    <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col justify-between h-full">
      {/* Box Header Bar */}
      <div className="bg-[#E2ECE5] border-b-2 border-[#BDCEBF] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <UploadCloud className="w-5 h-5 text-[#5A7D5C]" />
          <h2 className="text-base font-bold uppercase tracking-wider text-[#223326] font-mono">
            Evidence Ingestion
          </h2>
        </div>
        <button
          onClick={handleLoadSamples}
          disabled={isIngesting || isLoadingSamples}
          className="px-4 py-2.5 rounded-lg border-2 border-[#5A7D5C] bg-white hover:bg-[#5A7D5C] hover:text-white text-xs font-mono font-bold uppercase text-[#223326] transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>{isLoadingSamples ? "Loading..." : "Load Sample Evidence"}</span>
        </button>
      </div>

      {/* Box Body */}
      <div className="p-6 flex-1 flex flex-col justify-center">
        {/* Drop target (Strictly NO dashed borders) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all shadow-sm ${
            isDragOver
              ? "border-[#223326] bg-[#EBF3EE] ring-2 ring-[#5A7D5C]/30"
              : "border-[#BDCEBF] bg-[#F4F8F5] hover:border-[#4A6150] hover:bg-[#EBF3EE]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-[#BDCEBF] flex items-center justify-center text-[#5A7D5C] shadow-sm">
              <ArrowUpCircle className="w-6 h-6 stroke-[2]" />
            </div>

            {isIngesting ? (
              <div className="space-y-1">
                <p className="text-sm font-mono text-[#223326] font-bold">
                  CircularQueue: Processing batch...
                </p>
                <p className="text-xs text-[#5A6B5E] font-mono">
                  Hashing with SHA-256 and compressing via Huffman in C++
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm text-[#223326] font-bold font-mono">
                  Drag &amp; drop files here, or <span className="underline text-[#5A7D5C] cursor-pointer">browse</span>
                </p>
                <p className="text-xs text-[#5A6B5E] font-mono">
                  Raw binary, text, logs, configs (max 1 MB per file)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
