
import React, { useRef } from "react";
import { useD3SvgGraph } from "@/hooks/useD3SvgGraph";
import GraphD3NodeLayer from "./GraphD3NodeLayer";

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
  // Define these refs ONCE and reuse them everywhere
  const svgRef = useRef<SVGSVGElement>(null);
  const svgGroupRef = useRef<SVGGElement>(null);
  const nodeGroupRef = useRef<SVGGElement | null>(null);

  // useD3SvgGraph handles all D3 drawing, pass along new handlers using *the same refs*
  useD3SvgGraph({
    svgRef,
    svgGroupRef,
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
    simulation: null,
    simNodes: nodes,
    simEdges: edges,
  });

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 900 530"
      className="block"
    >
      {/* D3 draws everything inside this group */}
      <g ref={svgGroupRef} />
      {/* GraphD3NodeLayer mounts React components into the foreignObjects created by D3 */}
      <GraphD3NodeLayer
        simNodes={nodes}
        nodeGroupRef={nodeGroupRef}
        hiddenNodeIds={hiddenNodeIds}
        setHiddenNodeIds={setHiddenNodeIds}
        setContextNodeId={setContextNodeId}
        setHoveredNodeId={setHoveredNodeId}
      />
    </svg>
  );
};

export default GraphD3SvgLayer;
