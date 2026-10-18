export function fileToBase64(file: File): Promise<string> {
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
}

export async function loadSampleEvidenceFiles(): Promise<{ name: string; base64: string }[]> {
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
  return loadedFiles;
}
