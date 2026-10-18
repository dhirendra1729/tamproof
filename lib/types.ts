export interface EvidenceFile {
  id: string;
  name: string;
  size: number;
  storedHash: string;
  huffmanBits: number;
  compressionRatio: number;
  addedAt: string;
  status: "queued" | "processing" | "secured" | "tampered";
}

export interface MerkleNodeData {
  id: number;
  hash: string;
  leafIndex: number;
  left: MerkleNodeData | null;
  right: MerkleNodeData | null;
}

export interface ChainBlock {
  index: number;
  timestamp: string;
  action: string;
  details: string;
  prevHash: string;
  hash: string;
}

export interface BucketEntry {
  key: string;
  chain: number;
}

export interface VaultState {
  files: EvidenceFile[];
  merkleRoot: string;
  prevMerkleRoot: string;
  merkleTree: MerkleNodeData | null;
  chain: ChainBlock[];
  buckets: BucketEntry[][];
  stack: string[];
  queue: string[];
  urgentHeap: string[];
  chainValid: boolean;
  coreRestarted?: boolean;
}

export interface VerifyResult {
  tampered: string[];
  brokenPath: number[];
  chainValid: boolean;
  brokenAt: number;
  rootBefore: string;
  rootAfter: string;
}

export interface ProcessResult {
  processed: boolean;
  id?: string;
  name?: string;
  storedHash?: string;
  message?: string;
}
