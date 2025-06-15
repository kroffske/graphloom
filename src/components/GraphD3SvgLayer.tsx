import React, { useEffect } from "react";
import GraphD3NodeMount from "./GraphD3NodeMount";
import { useD3SvgGraph } from "@/hooks/useD3SvgGraph";

type GraphD3SvgLayerProps = {
  nodes: any[];
  edges: any[];
  layoutMode: "force" | "circle" | "hierarchy" | "manual";
  manualPositions: Record<string, { x: number; y: number }>;
  setManualPositions: (v: any) => void;
  saveManualPosition: (id: string, pos: { x: number; y: number }) => void;
  hiddenNodeIds: Set<string>;
  setHiddenNodeIds: (s: Set<string>) => void;
  setHoveredNodeId: (id: string | null) => void;
  setContextNodeId: (id: string | null) => void;
  dragging: any;
  setDragging: (d: any) => void;
  captureSimulationPositions: (simNodes: any[]) => void;
  initialPositions?: Record<string, { x: number; y: number }>;
  /**
   * Optional: show context menu for edge (edgeId, event)
   * You can plug in a UI or logic to display/hide a menu.
   */
  onEdgeContextMenu?: (edgeId: string, event: MouseEvent | React.MouseEvent) => void;
  setHoveredEdgeId?: (id: string | null) => void;
  setEdgeMousePos?: (pos: { x: number; y: number } | null) => void;
};

const GraphD3SvgLayer: React.FC<GraphD3SvgLayerProps> = ({
  nodes,
  edges,
  layoutMode,
  manualPositions,
  setManualPositions,
  saveManualPosition,
  hiddenNodeIds,
  setHiddenNodeIds,
  setHoveredNodeId,
  setContextNodeId,
  dragging,
  setDragging,
  captureSimulationPositions,
  initialPositions,
  onEdgeContextMenu,
  setHoveredEdgeId,
  setEdgeMousePos,
}) => {
  // useD3SvgGraph handles all D3 drawing, pass along new handlers
  useD3SvgGraph({
    svgRef: React.useRef<SVGSVGElement>(),
    svgGroupRef: React.useRef<SVGGElement>(null),
    nodes: nodes,
    edges: edges,
    layoutMode: layoutMode,
    manualPositions: manualPositions,
    setManualPositions: setManualPositions,
    saveManualPosition: saveManualPosition,
    hiddenNodeIds: hiddenNodeIds,
    setHiddenNodeIds: setHiddenNodeIds,
    setHoveredNodeId: setHoveredNodeId,
    setContextNodeId: setContextNodeId,
    dragging: dragging,
    setDragging: setDragging,
    captureSimulationPositions: captureSimulationPositions,
    initialPositions: initialPositions,
    onEdgeContextMenu,
    setHoveredEdgeId,
    setEdgeMousePos,
    simulation: null,
    simNodes: nodes,
    simEdges: edges,
  });
  const svgRef = React.useRef<SVGSVGElement>(null);
  const nodeGroupRef = React.useRef<SVGGElement>(null);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 900 530"
      className="block"
    >
      {/* D3 draws everything inside nodeGroupRef */}
      <g ref={nodeGroupRef} />
    </svg>
  );
};

export default GraphD3SvgLayer;
