import React from "react";
import GraphFlowNode from "./GraphFlowNode";
import { NODE_PALETTE } from "@/config/graphConstants";

/**
 * Color palette for types.
 */
export const getNodeColor = (type: string) => NODE_PALETTE[type] || "#64748b";

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
