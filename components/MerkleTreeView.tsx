"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GitFork, Info } from "lucide-react";
import { MerkleNodeData } from "@/lib/types";

interface MerkleTreeViewProps {
  tree: MerkleNodeData | null;
  brokenPath?: number[];
  merkleRoot: string;
}

interface VisualNode {
  id: number;
  hash: string;
  leafIndex: number;
  x: number;
  y: number;
  depth: number;
  isLeaf: boolean;
  left?: MerkleNodeData | null;
  right?: MerkleNodeData | null;
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
}: MerkleTreeViewProps) {
  const [hoveredNode, setHoveredNode] = useState<VisualNode | null>(null);

  // Layout calculation
  const { nodes, edges, width, height } = useMemo(() => {
    if (!tree) {
      return { nodes: [], edges: [], width: 600, height: 420 };
    }

    // 1. Determine max depth and total leaves
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
    const canvasWidth = Math.max(totalLeaves * 140, 600);
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

        if (leftV) {
          const isEdgeBroken = brokenSet.has(node.id) && brokenSet.has(leftV.id);
          const hop = brokenPath.indexOf(leftV.id);
          edgeList.push({ from: { id: node.id, hash: node.hash, leafIndex: node.leafIndex, x, y: 50 + depth * 75, depth, isLeaf }, to: leftV, isBroken: isEdgeBroken, hopIndex: hop });
        }
        if (rightV) {
          const isEdgeBroken = brokenSet.has(node.id) && brokenSet.has(rightV.id);
          const hop = brokenPath.indexOf(rightV.id);
          edgeList.push({ from: { id: node.id, hash: node.hash, leafIndex: node.leafIndex, x, y: 50 + depth * 75, depth, isLeaf }, to: rightV, isBroken: isEdgeBroken, hopIndex: hop });
        }
      }

      const y = 50 + depth * 75;
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
    const canvasHeight = Math.max(50 + (maxDepth + 1) * 80 + 30, 420);

    return { nodes: nodeList, edges: edgeList, width: canvasWidth, height: canvasHeight };
  }, [tree, brokenPath]);

  const brokenPathSet = useMemo(() => new Set(brokenPath), [brokenPath]);

  return (
    <div className="bg-[#11161f] border border-[#1f2937] rounded-lg p-5 flex flex-col justify-between h-full min-h-[460px] relative overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-200 font-mono">
            Merkle Tree Visualizer
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          {brokenPath.length > 0 ? (
            <span className="text-red-400 font-bold px-2 py-0.5 rounded bg-red-950/80 border border-red-500/50 animate-pulse">
              PATH CORRUPTED: [{brokenPath.join(" → ")}]
            </span>
          ) : (
            <span className="text-gray-400">
              Root: {merkleRoot ? `${merkleRoot.slice(0, 10)}...` : "None"}
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      {!tree ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-[#1f2937] rounded-lg text-center">
          <GitFork className="w-10 h-10 text-gray-600 mb-2" />
          <p className="text-sm font-mono text-gray-400">No Merkle Tree constructed</p>
          <p className="text-xs font-mono text-gray-500 mt-1">
            Ingest evidence files to generate binary tree commitments.
          </p>
        </div>
      ) : (
        <div className="flex-1 w-full overflow-auto custom-scrollbar border border-[#1f2937] rounded-md bg-[#0a0e14]/80 p-2 relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full min-h-[380px]"
            style={{ minWidth: `${width}px` }}
          >
            <defs>
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ef4444" floodOpacity="0.9" />
              </filter>
              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#22d3ee" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Render Edges */}
            {edges.map((edge, idx) => {
              const isBroken = edge.isBroken;
              const delay = edge.hopIndex >= 0 ? edge.hopIndex * 0.15 : 0;

              return (
                <motion.line
                  key={`edge-${idx}-${edge.from.id}-${edge.to.id}`}
                  x1={edge.from.x}
                  y1={edge.from.y}
                  x2={edge.to.x}
                  y2={edge.to.y}
                  stroke={isBroken ? "#ef4444" : "#1e293b"}
                  strokeWidth={isBroken ? 3 : 1.5}
                  filter={isBroken ? "url(#glow-red)" : undefined}
                  initial={isBroken ? { stroke: "#1e293b", strokeWidth: 1.5 } : {}}
                  animate={isBroken ? { stroke: "#ef4444", strokeWidth: 3 } : {}}
                  transition={{ delay, duration: 0.25 }}
                />
              );
            })}

            {/* Render Nodes */}
            {nodes.map((node) => {
              const isBroken = brokenPathSet.has(node.id);
              const hopIndex = brokenPath.indexOf(node.id);
              const delay = hopIndex >= 0 ? hopIndex * 0.15 : 0;
              const isRoot = node.id === tree.id;

              return (
                <g
                  key={`node-${node.id}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Outer pulsating ring for broken nodes */}
                  {isBroken && (
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={24}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth={2}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.2, 0.8] }}
                      transition={{ delay, repeat: Infinity, duration: 1.5 }}
                    />
                  )}

                  {/* Main Node Circle */}
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={18}
                    fill={isBroken ? "#450a0a" : "#11161f"}
                    stroke={isBroken ? "#ef4444" : "#22d3ee"}
                    strokeWidth={isBroken ? 2.5 : 1.5}
                    filter={isBroken ? "url(#glow-red)" : "url(#glow-cyan)"}
                    initial={isBroken ? { scale: 0.9 } : {}}
                    animate={isBroken ? { scale: 1 } : {}}
                    transition={{ delay, duration: 0.2 }}
                  />

                  {/* Node ID label */}
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill={isBroken ? "#fca5a5" : "#e5e7eb"}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    #{node.id}
                  </text>

                  {/* Truncated Hash label beneath node */}
                  <text
                    x={node.x}
                    y={node.y + 32}
                    textAnchor="middle"
                    fill={isBroken ? "#ef4444" : "#94a3b8"}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {node.hash.slice(0, 6)}...
                  </text>

                  {/* Leaf / Root tag */}
                  {node.isLeaf && (
                    <text
                      x={node.x}
                      y={node.y - 24}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      Leaf {node.leafIndex}
                    </text>
                  )}
                  {isRoot && (
                    <text
                      x={node.x}
                      y={node.y - 24}
                      textAnchor="middle"
                      fill={isBroken ? "#ef4444" : "#34d399"}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ROOT
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredNode && (
            <div
              className="absolute pointer-events-none z-20 px-3 py-2 bg-[#11161f]/95 border border-cyan-500/40 rounded-md shadow-xl text-xs font-mono"
              style={{
                left: Math.min(Math.max(hoveredNode.x - 100, 10), width - 260),
                top: Math.max(hoveredNode.y - 90, 10),
              }}
            >
              <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Node #{hoveredNode.id} {hoveredNode.isLeaf ? `(Leaf ${hoveredNode.leafIndex})` : "(Internal Hash)"}
              </div>
              <div className="text-[10px] text-gray-400 break-all">
                Hash: <span className="text-cyan-300">{hoveredNode.hash}</span>
              </div>
              {brokenPathSet.has(hoveredNode.id) && (
                <div className="text-[10px] text-red-400 font-semibold mt-1">
                  ⚠️ ON BROKEN INTEGRITY PATH
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
