"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, Sparkles, Loader2 } from "lucide-react";

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
        // Data URL format: "data:...;base64,xxxx"
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
    <div className="bg-[#11161f] border border-[#1f2937] rounded-lg p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-200 font-mono">
              Evidence Ingestion
            </h2>
          </div>
          <button
            onClick={loadSampleEvidence}
            disabled={isIngesting}
            className="px-2.5 py-1 rounded bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Load Sample Evidence
          </button>
        </div>

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
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            isDragOver
              ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              : "border-[#1f2937] hover:border-cyan-500/50 hover:bg-[#141a24]"
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
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-sm font-mono text-cyan-300 font-medium">
                  CircularQueue: Dequeueing & Hashing...
                </p>
                <p className="text-xs text-gray-400 font-mono">
                  Hashing with SHA-256 & Huffman compressing live in C++ engine
                </p>
              </>
            ) : (
              <>
                <FileText className="w-8 h-8 text-cyan-400/80" />
                <p className="text-sm text-gray-200 font-mono">
                  Drag & drop forensic files here, or <span className="text-cyan-400 underline">browse</span>
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  Supports up to 1 MB per file (text, logs, configs, binary)
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
