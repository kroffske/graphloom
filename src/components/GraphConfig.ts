
import React from "react";
import GraphNodeBox from "./GraphNodeBox";
import { useIconRegistry } from "./IconRegistry";

const nodePalette: Record<string, string> = {
  entity: "#2563eb",
  process: "#059669",
  "data-store": "#a21caf",
  event: "#eab308",
  decision: "#ef4444",
  "external-system": "#3b82f6",
};

export const getNodeColor = (type: string) => nodePalette[type] || "#64748b";

export const getNodeTypes = (setHoveredNodeId: (id: string | null) => void, onSelect: (id: string) => void) => ({
  custom: ({ id, data, selected }: any) => (
    <div
      onMouseEnter={() => setHoveredNodeId(data.nodeId)}
      onMouseLeave={() => setHoveredNodeId(null)}
    >
      <GraphNodeBox nodeId={data.nodeId} selected={selected} onSelect={onSelect} />
    </div>
  ),
});

// You can extend this with edgeTypes if you add custom edges.
export const edgeTypes = {}; // Currently unused, stub for expansion

