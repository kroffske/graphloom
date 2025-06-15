
import React from "react";
import type { GraphNode, GraphEdge } from "@/types/graph";
import UniversalTooltip from "./UniversalTooltip";

type GraphTooltipManagerProps = {
  hoveredNode?: GraphNode | null;
  hoveredEdge?: GraphEdge | null;
  position: { x: number; y: number } | null;
};

const GraphTooltipManager: React.FC<GraphTooltipManagerProps> = ({ hoveredNode, hoveredEdge, position }) => {
  const item = hoveredNode || hoveredEdge;
  const type = hoveredNode ? 'node' : (hoveredEdge ? 'edge' : null);
  
  return <UniversalTooltip item={item} type={type} position={position} />;
};

export default GraphTooltipManager;
