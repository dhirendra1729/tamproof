"use client";

import React, { useMemo, useState } from "react";
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
      return { nodes: [], edges: [], width: 700, height: 440 };
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
    const canvasWidth = Math.max(totalLeaves * 160, 700);
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
          edgeList.push({
            from: { id: node.id, hash: node.hash, leafIndex: node.leafIndex, x, y: 50 + depth * 80, depth, isLeaf },
            to: leftV,
            isBroken: isEdgeBroken,
            hopIndex: hop,
          });
        }
        if (rightV) {
          const isEdgeBroken = brokenSet.has(node.id) && brokenSet.has(rightV.id);
          const hop = brokenPath.indexOf(rightV.id);
          edgeList.push({
            from: { id: node.id, hash: node.hash, leafIndex: node.leafIndex, x, y: 50 + depth * 80, depth, isLeaf },
            to: rightV,
            isBroken: isEdgeBroken,
            hopIndex: hop,
          });
        }
      }

      const y = 50 + depth * 80;
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
    const canvasHeight = Math.max(50 + (maxDepth + 1) * 85 + 35, 440);

    return { nodes: nodeList, edges: edgeList, width: canvasWidth, height: canvasHeight };
  }, [tree, brokenPath]);

  const brokenPathSet = useMemo(() => new Set(brokenPath), [brokenPath]);

  return (
    <div className="bg-white border-2 border-[#4A6150] rounded-xl overflow-hidden shadow-cardFrame flex flex-col justify-between h-full min-h-[480px] relative">
      {/* Panel Header */}
      <div className="bg-[#E2ECE5] border-b-2 border-[#4A6150]/30 px-5 py-3.5 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#223326] font-mono">
          Merkle Tree Visualizer
        </h2>
        <div className="flex items-center gap-2 text-xs font-mono">
          {brokenPath.length > 0 ? (
            <span className="text-[#D9383A] font-bold px-2 py-0.5 rounded bg-[#FEE2E2] border-2 border-[#D9383A] animate-pulse">
              CORRUPTED PATH: [{brokenPath.join(" → ")}]
            </span>
          ) : (
            <span className="text-[#5A6B5E] font-bold px-2 py-0.5 rounded bg-white border border-[#BDCEBF]">
              Root: {merkleRoot ? `${merkleRoot.slice(0, 10)}...` : "None"}
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas Box */}
      <div className="p-5 flex-1 flex flex-col">
        {!tree ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#BDCEBF] rounded-lg text-center bg-[#F4F8F5]">
            <p className="text-sm font-mono text-[#223326] font-bold">No Merkle Tree Constructed</p>
            <p className="text-xs font-mono text-[#5A6B5E] mt-1">
              Ingest evidence files to generate binary tree commitments.
            </p>
          </div>
        ) : (
          <div className="flex-1 w-full overflow-auto custom-scrollbar border-2 border-[#BDCEBF] rounded-lg bg-[#F4F8F5] p-3 relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full min-h-[380px]"
              style={{ minWidth: `${width}px` }}
            >
            {/* Render Edges */}
            {edges.map((edge, idx) => {
              const isBroken = edge.isBroken;

              return (
                <line
                  key={`edge-${idx}-${edge.from.id}-${edge.to.id}`}
                  x1={edge.from.x}
                  y1={edge.from.y}
                  x2={edge.to.x}
                  y2={edge.to.y}
                  stroke={isBroken ? "#D9383A" : "#BDCEBF"}
                  strokeWidth={isBroken ? 3.5 : 2}
                  className="transition-colors duration-300"
                />
              );
            })}

            {/* Render Nodes */}
            {nodes.map((node) => {
              const isBroken = brokenPathSet.has(node.id);
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
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={24}
                      fill="none"
                      stroke="#D9383A"
                      strokeWidth={2}
                      className="animate-ping origin-center opacity-70"
                      style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={18}
                    fill={isBroken ? "#FEE2E2" : "#FFFFFF"}
                    stroke={isBroken ? "#D9383A" : "#223326"}
                    strokeWidth={isBroken ? 3 : 2}
                    className="transition-all duration-200"
                  />

                  {/* Node ID label */}
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill={isBroken ? "#D9383A" : "#223326"}
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
                    fill={isBroken ? "#D9383A" : "#5A6B5E"}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight={isBroken ? "bold" : "normal"}
                  >
                    {node.hash.slice(0, 6)}...
                  </text>

                  {/* Leaf / Root tag */}
                  {node.isLeaf && (
                    <text
                      x={node.x}
                      y={node.y - 24}
                      textAnchor="middle"
                      fill="#5A7D5C"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      Leaf {node.leafIndex}
                    </text>
                  )}
                  {isRoot && (
                    <text
                      x={node.x}
                      y={node.y - 24}
                      textAnchor="middle"
                      fill={isBroken ? "#D9383A" : "#223326"}
                      fontSize="11"
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
              className="absolute pointer-events-none z-20 px-3 py-2 bg-white border-2 border-[#223326] rounded shadow-lg text-xs font-mono"
              style={{
                left: Math.min(Math.max(hoveredNode.x - 100, 15), width - 260),
                top: Math.max(hoveredNode.y - 85, 15),
              }}
            >
              <div className="font-bold text-[#223326] mb-0.5">
                Node #{hoveredNode.id} {hoveredNode.isLeaf ? `(Leaf ${hoveredNode.leafIndex})` : "(Internal Hash)"}
              </div>
              <div className="text-[10px] text-[#5A6B5E] break-all">
                Hash: <span className="text-[#223326] font-bold">{hoveredNode.hash}</span>
              </div>
              {brokenPathSet.has(hoveredNode.id) && (
                <div className="text-[10px] text-[#D9383A] font-bold mt-1">
                  ON CORRUPTED INTEGRITY PATH
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
