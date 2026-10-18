import { VaultState, VerifyResult, ProcessResult } from "./types";

async function postCmd<T>(body: Record<string, any>): Promise<T> {
  const res = await fetch("/api/vault", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.error || "Failed to execute vault command");
  }
  return data.result as T;
}

export const api = {
  ping: () => postCmd<{ pong: boolean; status: string }>({ cmd: "ping" }),
  
  enqueue: (name: string, data_b64: string) =>
    postCmd<{ enqueued: boolean; name: string }>({ cmd: "enqueue", name, data_b64 }),

  processNext: () =>
    postCmd<ProcessResult>({ cmd: "process_next" }),

  verify: () =>
    postCmd<VerifyResult>({ cmd: "verify" }),

  tamperFile: (file: string) =>
    postCmd<{ tampered: boolean; file: string }>({ cmd: "tamper_file", file }),

  tamperBlock: (index: number, details: string) =>
    postCmd<{ tampered: boolean; index: number }>({ cmd: "tamper_block", index, details }),

  undo: () =>
    postCmd<{ undone: boolean; message?: string }>({ cmd: "undo" }),

  flagUrgent: (file: string) =>
    postCmd<{ flagged: boolean; file: string }>({ cmd: "flag_urgent", file }),

  processUrgent: () =>
    postCmd<{ fileId: string; intact: boolean }>({ cmd: "process_urgent" }),

  state: () =>
    postCmd<VaultState>({ cmd: "state" }),

  reset: () =>
    postCmd<{ reset: boolean }>({ cmd: "reset" }),
};
