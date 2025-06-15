import React, { useState, useEffect } from "react";
import { useGraphStore, GraphStore } from "@/state/useGraphStore";
import { useGraphLogic } from "@/hooks/useGraphLogic";
import GraphRenderer from "./GraphRenderer";
import GraphTooltipManager from "./GraphTooltipManager";
import { shallow } from "zustand/shallow";

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
  const {
    nodes: storeNodes,
    edges: storeEdges,
    hoveredEdgeId,
  } = useGraphStore(
    (state: GraphStore) => ({
      nodes: state.nodes,
      edges: state.edges,
      hoveredEdgeId: state.hoveredEdgeId,
    }),
    shallow
  );

  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Find the node or edge that is currently hovered, if any
  const hoveredNode = storeNodes.find((n) => n.id === hoveredNodeId);
  const hoveredEdge = storeEdges.find((e) => e.id === hoveredEdgeId);

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
      <GraphTooltipManager
        hoveredNode={hoveredNode}
        hoveredEdge={hoveredEdge}
        position={position}
      />
    </div>
  );
};

export default GraphCanvas;
