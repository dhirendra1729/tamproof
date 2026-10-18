"use client";

import React, { useState, useRef } from "react";

interface DropzoneProps {
  onFilesSelected: (files: { name: string; base64: string }[]) => void;
  isIngesting: boolean;
}

export function Dropzone({ onFilesSelected, isIngesting }: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const commaIdx = result.indexOf(",");
        resolve(commaIdx !== -1 ? result.slice(commaIdx + 1) : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

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

  const loadSampleEvidence = async () => {
    try {
      const samples = [
        { name: "note.txt", url: "/sample-evidence/note.txt" },
        { name: "log.csv", url: "/sample-evidence/log.csv" },
        { name: "config.json", url: "/sample-evidence/config.json" },
      ];

      const loadedFiles: { name: string; base64: string }[] = [];
      for (const sample of samples) {
        const res = await fetch(sample.url);
        const blob = await res.blob();
        const file = new File([blob], sample.name);
        const b64 = await fileToBase64(file);
        loadedFiles.push({ name: sample.name, base64: b64 });
      }

      onFilesSelected(loadedFiles);
    } catch (err) {
      console.error("Failed to load sample evidence:", err);
      alert("Failed to load sample evidence files");
    }
  };

  return (
    <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col justify-between h-full">
      {/* Box Header Bar */}
      <div className="bg-[#E2ECE5] border-b-2 border-[#4A6150]/30 px-5 py-3.5 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#223326] font-mono">
          Evidence Ingestion
        </h2>
        <button
          onClick={loadSampleEvidence}
          disabled={isIngesting}
          className="px-3.5 py-1.5 rounded border-2 border-[#5A7D5C] bg-white hover:bg-[#5A7D5C] hover:text-white text-xs font-mono font-bold text-[#223326] transition-colors disabled:opacity-50 shadow-sm"
        >
          Load Sample Evidence
        </button>
      </div>

      {/* Box Body */}
      <div className="p-5 flex-1 flex flex-col justify-center">
        {/* Drop target */}
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
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragOver
              ? "border-[#223326] bg-[#EBF3EE]"
              : "border-[#5A7D5C] bg-[#F4F8F5] hover:border-[#223326] hover:bg-[#EBF3EE]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            {isIngesting ? (
              <>
                <p className="text-sm font-mono text-[#223326] font-bold">
                  CircularQueue: Processing batch...
                </p>
                <p className="text-xs text-[#5A6B5E] font-mono">
                  Hashing with SHA-256 and compressing via Huffman in C++
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-[#223326] font-bold font-mono">
                  Drag &amp; drop files here, or <span className="underline text-[#5A7D5C]">browse</span>
                </p>
                <p className="text-xs text-[#5A6B5E] font-mono mt-0.5">
                  Raw binary, text, logs, configs (max 1 MB per file)
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
