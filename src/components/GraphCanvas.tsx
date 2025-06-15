
import React from "react";
import { useGraphStore } from "@/state/useGraphStore";
import { useGraphLogic } from "@/hooks/useGraphLogic";
import GraphRenderer from "./GraphRenderer";
import GraphTooltipManager from "./GraphTooltipManager";

/**
 * The composition root for the graph area: handles layout and orchestrates
 * all behavior, but delegates rendering and logic.
 */
const GraphCanvas = () => {
  const {
    rfNodes,
    rfEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    hoveredNodeId,
    setHoveredNodeId,
  } = useGraphLogic();
  const { nodes: storeNodes } = useGraphStore();

  // Find the node that is currently hovered, if any
  const hoveredNode = storeNodes.find((n) => n.id === hoveredNodeId);

  return (
    <div className="relative w-full h-[70vh] bg-background border rounded-lg overflow-hidden shadow-lg">
      <GraphRenderer
        rfNodes={rfNodes}
        rfEdges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        hoveredNodeId={hoveredNodeId}
        setHoveredNodeId={setHoveredNodeId}
      />
      <GraphTooltipManager node={hoveredNode} />
    </div>
  );
};

export default GraphCanvas;
