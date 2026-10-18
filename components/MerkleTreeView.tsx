"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Play, RotateCcw, FolderPlus, GitFork, AlertTriangle, ShieldCheck } from "lucide-react";
import { MerkleNodeData, VerifyResult } from "@/lib/types";
import { loadSampleEvidenceFiles } from "./sampleLoader";

interface MerkleTreeViewProps {
  tree: MerkleNodeData | null;
  brokenPath?: number[];
  merkleRoot: string;
  verifyResult: VerifyResult | null;
  isVerifying: boolean;
  fileCount: number;
  onVerify: () => void;
  onFilesSelected: (files: { name: string; base64: string }[]) => void;
}

interface VisualNode {
  id: number;
  hash: string;
  leafIndex: number;
  x: number;
  y: number;
  depth: number;
  isLeaf: boolean;
}

interface VisualEdge {
  from: VisualNode;
  to: VisualNode;
  isBroken: boolean;
  hopIndex: number;
}

export function MerkleTreeView({
  tree,
  brokenPath = [],
  merkleRoot,
  verifyResult,
  isVerifying,
  fileCount,
  onVerify,
  onFilesSelected,
}: MerkleTreeViewProps) {
  const [hoveredNode, setHoveredNode] = useState<VisualNode | null>(null);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleLoadSamples = async () => {
    try {
      setLoadingSamples(true);
      const files = await loadSampleEvidenceFiles();
      onFilesSelected(files);
    } catch (err) {
      console.error("Failed to load sample evidence:", err);
    } finally {
      setLoadingSamples(false);
    }
  };

  // Layout calculation
  const { nodes, edges, width, height } = useMemo(() => {
    if (!tree) {
      return { nodes: [], edges: [], width: 780, height: 500 };
    }

    let leafCounter = 0;
    const leafPositions = new Map<number, number>();

    const assignLeafX = (node: MerkleNodeData): void => {
      if (!node.left && !node.right) {
        leafPositions.set(node.id, leafCounter++);
        return;
      }
      if (node.left) assignLeafX(node.left);
      if (node.right) assignLeafX(node.right);
    };
    assignLeafX(tree);

    const totalLeaves = Math.max(leafCounter, 1);
    const canvasWidth = Math.max(totalLeaves * 160, 780);
    const leafSpacing = canvasWidth / (totalLeaves + 1);

    const nodeList: VisualNode[] = [];
    const edgeList: VisualEdge[] = [];
    const brokenSet = new Set(brokenPath);

    const layout = (node: MerkleNodeData, depth: number): VisualNode => {
      let x = 0;
      const isLeaf = !node.left && !node.right;

      if (isLeaf) {
        const leafIdx = leafPositions.get(node.id) ?? 0;
        x = (leafIdx + 1) * leafSpacing;
      } else {
        const leftV = node.left ? layout(node.left, depth + 1) : null;
        const rightV = node.right ? layout(node.right, depth + 1) : null;

        if (leftV && rightV) {
          x = (leftV.x + rightV.x) / 2;
        } else if (leftV) {
          x = leftV.x;
        } else if (rightV) {
          x = rightV.x;
        }

        const currentNodeY = 70 + depth * 95;

        if (leftV) {
          const isEdgeBroken = brokenSet.has(node.id) && brokenSet.has(leftV.id);
          const hop = brokenPath.indexOf(leftV.id);
          edgeList.push({
            from: { id: node.id, hash: node.hash, leafIndex: node.leafIndex, x, y: currentNodeY, depth, isLeaf },
            to: leftV,
            isBroken: isEdgeBroken,
            hopIndex: hop,
          });
        }
        if (rightV) {
          const isEdgeBroken = brokenSet.has(node.id) && brokenSet.has(rightV.id);
          const hop = brokenPath.indexOf(rightV.id);
          edgeList.push({
            from: { id: node.id, hash: node.hash, leafIndex: node.leafIndex, x, y: currentNodeY, depth, isLeaf },
            to: rightV,
            isBroken: isEdgeBroken,
            hopIndex: hop,
          });
        }
      }

      const y = 70 + depth * 95;
      const vNode: VisualNode = {
        id: node.id,
        hash: node.hash,
        leafIndex: node.leafIndex,
        x,
        y,
        depth,
        isLeaf,
      };
      nodeList.push(vNode);
      return vNode;
    };

    layout(tree, 0);
    const maxDepth = Math.max(...nodeList.map((n) => n.depth), 0);
    const canvasHeight = Math.max(70 + (maxDepth + 1) * 95 + 45, 500);

    return { nodes: nodeList, edges: edgeList, width: canvasWidth, height: canvasHeight };
  }, [tree, brokenPath]);

  const brokenPathSet = useMemo(() => new Set(brokenPath), [brokenPath]);
  const hasTamper = brokenPath.length > 0;

  const rootBefore = verifyResult?.rootBefore;
  const rootAfter = verifyResult?.rootAfter;
  const hasRootMismatch = Boolean(rootBefore && rootAfter && rootBefore !== rootAfter);

  return (
    <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col justify-between h-full min-h-[560px] lg:min-h-[600px] relative select-none">
      {/* Panel Header Bar with Primary Verify Button & Root Chip */}
      <div className="bg-[#E2ECE5] border-b-2 border-[#BDCEBF] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-[#223326] font-mono">
            Merkle Tree Visualizer
          </h2>
          <p className="text-xs text-[#5A6B5E] font-sans mt-0.5 font-medium">
            Binary commitment tree computed by C++17 core engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Animated Root Hash Chip */}
          <div className="px-3.5 py-2 rounded-lg border-2 border-[#BDCEBF] bg-[#F4F8F5] text-xs font-mono flex items-center gap-2 shadow-sm">
            <span className="text-[#5A6B5E] font-bold text-[11px]">Root:</span>
            {hasRootMismatch ? (
              <div className="flex items-center gap-1 font-bold">
                <span className="line-through text-[#D9383A]/70">{rootBefore?.slice(0, 8)}...</span>
                <span className="text-[#D9383A]">→</span>
                <span className="text-[#D9383A]">{rootAfter?.slice(0, 8)}...</span>
              </div>
            ) : (
              <span className="text-[#223326] font-bold">
                {merkleRoot ? `${merkleRoot.slice(0, 8)}...${merkleRoot.slice(-8)}` : "None"}
              </span>
            )}
          </div>

          {/* Primary Call to Action Button */}
          <button
            onClick={onVerify}
            disabled={isVerifying || fileCount === 0}
            className={`px-5 py-2.5 rounded-lg border-2 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 ${
              hasTamper
                ? "bg-[#D9383A] hover:bg-[#B91C1C] border-[#D9383A] text-white animate-pulse"
                : "bg-[#223326] hover:bg-[#5A7D5C] border-[#223326] hover:border-[#5A7D5C] text-white"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isVerifying ? "Verifying..." : "Run Integrity Check"}</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="p-6 flex-1 flex flex-col justify-center">
        {!tree ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 border-2 border-[#BDCEBF] rounded-xl text-center bg-[#F4F8F5]">
            <GitFork className="w-10 h-10 text-[#5A7D5C] mb-3 stroke-[1.5]" />
            <h3 className="text-base font-mono font-bold text-[#223326]">
              No Merkle Tree Constructed Yet
            </h3>
            <p className="text-xs text-[#5A6B5E] font-sans mt-1.5 max-w-md">
              Ingest evidence records to trigger the C++ binary tree commitment engine and build live verification proofs.
            </p>
            <button
              onClick={handleLoadSamples}
              disabled={loadingSamples}
              className="mt-5 px-6 py-2.5 rounded-lg border-2 border-[#5A7D5C] bg-white hover:bg-[#EBF3EE] text-xs font-mono font-bold text-[#223326] transition-colors shadow-sm flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4 text-[#5A7D5C]" />
              <span>{loadingSamples ? "Loading..." : "Load Sample Evidence"}</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 w-full overflow-auto custom-scrollbar border-2 border-[#BDCEBF] rounded-xl bg-[#F4F8F5] p-4 relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full min-h-[440px]"
              style={{ minWidth: `${width}px` }}
            >
              {/* Render Edges */}
              {edges.map((edge, idx) => {
                const isBroken = edge.isBroken;
                const hopIndex = Math.max(edge.hopIndex, 0);
                const delay = shouldReduceMotion ? 0 : hopIndex * 0.35;

                return (
                  <g key={`edge-group-${idx}-${edge.from.id}-${edge.to.id}`}>
                    <motion.line
                      x1={edge.from.x}
                      y1={edge.from.y}
                      x2={edge.to.x}
                      y2={edge.to.y}
                      stroke={isBroken ? "#D9383A" : "#BDCEBF"}
                      strokeWidth={isBroken ? 3.5 : 2}
                      initial={hasTamper && isBroken && !shouldReduceMotion ? { stroke: "#BDCEBF", strokeWidth: 2 } : {}}
                      animate={{
                        stroke: isBroken ? "#D9383A" : "#BDCEBF",
                        strokeWidth: isBroken ? 3.5 : 2,
                        opacity: hasTamper && !isBroken ? 0.4 : 1,
                      }}
                      transition={{ delay, duration: 0.3 }}
                    />

                    {/* Traveling signal circle along broken edge */}
                    {isBroken && !shouldReduceMotion && (
                      <motion.circle
                        r={4.5}
                        fill="#D9383A"
                        initial={{ cx: edge.to.x, cy: edge.to.y, opacity: 0 }}
                        animate={{
                          cx: [edge.to.x, edge.from.x],
                          cy: [edge.to.y, edge.from.y],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          delay,
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 1.5,
                        }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Render Nodes with r=22 (larger, projector-ready) */}
              {nodes.map((node) => {
                const isBroken = brokenPathSet.has(node.id);
                const hopIndex = Math.max(brokenPath.indexOf(node.id), 0);
                const delay = shouldReduceMotion ? 0 : hopIndex * 0.35;
                const isRoot = node.id === tree.id;

                return (
                  <motion.g
                    key={`node-${node.id}`}
                    layout={!shouldReduceMotion}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    animate={{
                      opacity: hasTamper && !isBroken ? 0.4 : 1,
                    }}
                  >
                    {/* Pulsating ring for broken nodes */}
                    {isBroken && (
                      <motion.circle
                        cx={node.x}
                        cy={node.y}
                        r={30}
                        fill="none"
                        stroke="#D9383A"
                        strokeWidth={2}
                        initial={shouldReduceMotion ? {} : { scale: 0.8, opacity: 0 }}
                        animate={shouldReduceMotion ? { opacity: 0.8 } : { scale: [1, 1.3, 1], opacity: [0.9, 0.2, 0.9] }}
                        transition={{ delay, repeat: Infinity, duration: 1.6 }}
                      />
                    )}

                    {/* Node Circle (r=22 for clear viewing) */}
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={22}
                      fill={isBroken ? "#FEE2E2" : "#FFFFFF"}
                      stroke={isBroken ? "#D9383A" : "#223326"}
                      strokeWidth={isBroken ? 3.5 : 2}
                      initial={hasTamper && isBroken && !shouldReduceMotion ? { scale: 0.9 } : {}}
                      animate={{ scale: 1 }}
                      transition={{ delay, duration: 0.25 }}
                    />

                    {/* Node ID label (12px bold) */}
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill={isBroken ? "#D9383A" : "#223326"}
                      fontSize="12"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      #{node.id}
                    </text>

                    {/* Truncated Hash label beneath node (11px mono) */}
                    <text
                      x={node.x}
                      y={node.y + 36}
                      textAnchor="middle"
                      fill={isBroken ? "#D9383A" : "#5A6B5E"}
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight={isBroken ? "bold" : "600"}
                    >
                      {node.hash.slice(0, 6)}...
                    </text>

                    {/* Leaf / Root Tag */}
                    {node.isLeaf && (
                      <text
                        x={node.x}
                        y={node.y - 28}
                        textAnchor="middle"
                        fill="#5A7D5C"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        Leaf {node.leafIndex}
                      </text>
                    )}
                    {isRoot && (
                      <text
                        x={node.x}
                        y={node.y - 28}
                        textAnchor="middle"
                        fill={isBroken ? "#D9383A" : "#223326"}
                        fontSize="12"
                        fontFamily="monospace"
                        fontWeight="black"
                      >
                        ROOT
                      </text>
                    )}
                  </motion.g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredNode && (
              <div
                className="absolute pointer-events-none z-20 px-4 py-2.5 bg-white border-2 border-[#223326] rounded-lg shadow-lg text-xs font-mono"
                style={{
                  left: Math.min(Math.max(hoveredNode.x - 110, 15), width - 290),
                  top: Math.max(hoveredNode.y - 95, 15),
                }}
              >
                <div className="font-bold text-[#223326] mb-1">
                  Node #{hoveredNode.id} {hoveredNode.isLeaf ? `(Leaf ${hoveredNode.leafIndex})` : "(Internal Combined Hash)"}
                </div>
                <div className="text-[11px] text-[#5A6B5E] break-all leading-relaxed">
                  Hash: <span className="text-[#223326] font-bold">{hoveredNode.hash}</span>
                </div>
                {brokenPathSet.has(hoveredNode.id) && (
                  <div className="text-[11px] text-[#D9383A] font-bold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#D9383A]" />
                    <span>ON CORRUPTED INTEGRITY PATH</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
