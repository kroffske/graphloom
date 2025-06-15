
import React from "react";
import GraphFlowNode from "./GraphFlowNode";

/**
 * Color palette for types.
 */
const nodePalette: Record<string, string> = {
  entity: "#2563eb",
  process: "#059669",
  "data-store": "#a21caf",
  event: "#eab308",
  decision: "#ef4444",
  "external-system": "#3b82f6",
};

export const getNodeColor = (type: string) => nodePalette[type] || "#64748b";

/**
 * Returns nodeTypes mapping for ReactFlow.
 */
export const getNodeTypes = (setHoveredNodeId: (id: string | null) => void, onSelect: (id: string) => void) => ({
  custom: (props: any) => (
    <GraphFlowNode
      {...props}
      setHoveredNodeId={setHoveredNodeId}
      onSelect={onSelect}
    />
  ),
});

// You can extend this with edgeTypes if you add custom edges.
export const edgeTypes = {}; // Currently unused, stub for expansion
