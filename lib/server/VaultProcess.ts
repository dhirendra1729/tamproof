import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

class VaultProcessBridge {
  private child: ChildProcessWithoutNullStreams | null = null;
  private pending: Map<number, PendingRequest> = new Map();
  private nextId: number = 1;
  private buffer: string = "";
  private hasRestarted: boolean = false;

  constructor() {
    this.ensureProcess();
  }

  private ensureProcess() {
    if (this.child && !this.child.killed && this.child.exitCode === null) {
      return;
    }

    const binPath = path.resolve(process.cwd(), "core/build/vault_core");
    try {
      this.child = spawn(binPath, [], {
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (err) {
      console.error("[VaultProcess] Failed to spawn vault_core:", err);
      throw err;
    }

    this.child.stderr?.on("data", (chunk: Buffer) => {
      console.error("[vault_core stderr]:", chunk.toString("utf8"));
    });

    this.child.stdout.on("data", (chunk: Buffer) => {
      this.buffer += chunk.toString("utf8");
      let newlineIdx = this.buffer.indexOf("\n");
      while (newlineIdx !== -1) {
        const line = this.buffer.slice(0, newlineIdx).trim();
        this.buffer = this.buffer.slice(newlineIdx + 1);
        if (line.length > 0) {
          this.handleLine(line);
        }
        newlineIdx = this.buffer.indexOf("\n");
      }
    });

    this.child.on("error", (err) => {
      console.error("[VaultProcess] child error:", err);
      this.handleProcessDeath();
    });

    this.child.on("exit", (code, signal) => {
      console.warn(`[VaultProcess] vault_core exited with code ${code}, signal ${signal}`);
      this.handleProcessDeath();
    });
  }

  private handleProcessDeath() {
    this.child = null;
    this.hasRestarted = true;
    for (const [, req] of this.pending) {
      req.reject(new Error("core process died"));
    }
    this.pending.clear();
    this.buffer = "";
  }

  private handleLine(line: string) {
    try {
      const res = JSON.parse(line);
      const reqId = res.id;
      if (reqId !== undefined && this.pending.has(reqId)) {
        const { resolve, reject } = this.pending.get(reqId)!;
        this.pending.delete(reqId);
        if (res.ok) {
          resolve(res.result);
        } else {
          reject(new Error(res.error || "Unknown core error"));
        }
      }
    } catch (e) {
      console.error("[VaultProcess] Malformed line from vault_core:", line, e);
    }
  }

  public async send(command: Record<string, any>): Promise<any> {
    this.ensureProcess();
    if (!this.child || !this.child.stdin.writable) {
      throw new Error("vault_core process stdin not writable");
    }

    const id = this.nextId++;
    const payload = { ...command, id };

    return new Promise((resolve, reject) => {
      this.pending.set(id, {
        resolve: (result) => {
          if (command.cmd === "state" && this.hasRestarted) {
            result.coreRestarted = true;
            this.hasRestarted = false;
          }
          resolve(result);
        },
        reject,
      });

      try {
        this.child!.stdin.write(JSON.stringify(payload) + "\n");
      } catch (err) {
        this.pending.delete(id);
        reject(err);
      }
    });
  }
}

// Module-global guard across hot reloads in Next.js
declare global {
  // eslint-disable-next-line no-var
  var __vaultBridge: VaultProcessBridge | undefined;
}

if (!globalThis.__vaultBridge) {
  globalThis.__vaultBridge = new VaultProcessBridge();
}

export const vaultProcess = globalThis.__vaultBridge;
