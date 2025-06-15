import React, { useMemo, useCallback } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Background,
  Controls,
} from "@xyflow/react";
import { useGraphStore } from "@/state/useGraphStore";
import { useIconRegistry } from "./IconRegistry";
import AttributeTooltip from "./AttributeTooltip";

type RFNode = Node & { data: { nodeId: string } };

const getNodeColor = (type: string) => {
  const palette: Record<string, string> = {
    entity: "#2563eb",
    process: "#059669",
    "data-store": "#a21caf",
    event: "#eab308",
    decision: "#ef4444",
    "external-system": "#3b82f6",
  };
  return palette[type] || "#64748b";
};

const GraphCanvas = () => {
  const { nodes, edges, selectNode } = useGraphStore();
  const iconRegistry = useIconRegistry();
  // Map Zustand nodes/edges to ReactFlow format
  const rfNodes = useMemo<RFNode[]>(
    () =>
      nodes.map((n) => ({
        id: n.id,
        position: { x: n.x ?? Math.random() * 500, y: n.y ?? Math.random() * 400 },
        type: "custom",
        data: { nodeId: n.id },
        selectable: true,
      })),
    [nodes]
  );
  const rfEdges = useMemo<Edge[]>(
    () =>
      edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "default",
      })),
    [edges]
  );

  // Local state for hover, for tooltips
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);

  // Node renderer
  const nodeTypes = useMemo(
    () => ({
      custom: ({ id, data, selected }: any) => {
        const node = nodes.find((n) => n.id === data.nodeId);
        const Icon = node ? iconRegistry[node.type] : null;
        return (
          <div
            className={`flex flex-col items-center px-3 py-2 rounded-lg shadow-md cursor-pointer outline-none border-2  ${selected ? "border-primary ring-2 ring-blue-300" : "border-transparent"} bg-white dark:bg-card transition-colors duration-200`}
            tabIndex={0}
            role="button"
            aria-label={node?.label || "Node"}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") selectNode(node?.id ?? null);
            }}
            onMouseEnter={() => setHoveredNodeId(node?.id ?? null)}
            onMouseLeave={() => setHoveredNodeId(null)}
            onClick={() => selectNode(node?.id ?? null)}
            style={{ minWidth: 64, minHeight: 64, outline: "none" }}
          >
            {Icon && (
              <Icon
                className="w-8 h-8 mb-1"
                aria-label={node.type}
                filled={false}
              />
            )}
            <span className="text-xs font-medium truncate max-w-[80px] text-foreground">{node?.label ?? ""}</span>
          </div>
        );
      },
    }),
    [nodes, iconRegistry, selectNode]
  );

  // Tooltip logic (independent floating card)
  const hoveredNode = nodes.find((n) => n.id === hoveredNodeId);

  return (
    <div className="relative w-full h-[70vh] bg-background border rounded-lg overflow-hidden transition-colors shadow-lg">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        elementsSelectable
        nodesConnectable={false}
        panOnDrag
        zoomOnScroll
        fitView
        onNodeMouseEnter={(_, n) => setHoveredNodeId(n.id)}
        onNodeMouseLeave={() => setHoveredNodeId(null)}
        onNodeClick={(_, n) => selectNode(n.id)}
      >
        <Background gap={14} size={1} color="#e5e7eb" />
        <Controls />
      </ReactFlow>
      <AttributeTooltip node={hoveredNode} />
    </div>
  );
};

export default GraphCanvas;
