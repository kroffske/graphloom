import React, { useRef } from "react";
import { useD3Layout } from "@/hooks/useD3Layout";
import { useD3SvgGraph } from "@/hooks/useD3SvgGraph";
import GraphD3SvgFrame from "./GraphD3SvgFrame";

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
  setHoveredEdgeId: (id: string | null) => void;
  setContextNodeId: (id: string | null) => void;
  dragging: any;
  setDragging: (d: any) => void;
  captureSimulationPositions: (simNodes: any[]) => void;
  initialPositions?: Record<string, { x: number; y: number }>;
  // NEW: edge context menu handler
  onEdgeContextMenu?: (edgeId: string, event: MouseEvent | React.MouseEvent) => void;
  usePortalRendering?: boolean;
};

const GraphD3SvgLayer: React.FC<GraphD3SvgLayerProps> = (props) => {
  const {
    nodes,
    edges,
    layoutMode,
    manualPositions,
    setManualPositions,
    saveManualPosition,
    hiddenNodeIds,
    setHiddenNodeIds,
    setHoveredNodeId,
    setHoveredEdgeId,
    setContextNodeId,
    dragging,
    setDragging,
    captureSimulationPositions,
    initialPositions,
    onEdgeContextMenu,
    usePortalRendering = false,
  } = props;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const svgGroupRef = useRef<SVGGElement | null>(null);
  const linkRef = useRef<SVGGElement | null>(null);
  const nodeGroupRef = useRef<SVGGElement | null>(null);

  const { simulation, simNodes, simEdges } = useD3Layout(
    layoutMode,
    nodes,
    edges,
    manualPositions,
    initialPositions
  );

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
    setHoveredEdgeId,
    setContextNodeId,
    dragging,
    setDragging,
    captureSimulationPositions,
    initialPositions,
    simulation,
    simNodes,
    simEdges,
    onEdgeContextMenu: onEdgeContextMenu as any,
    usePortalRendering,
  });

  // Pass svgRef down to GraphD3SvgFrame
  return (
    <GraphD3SvgFrame
      svgRef={svgRef}
      simEdges={simEdges}
      simNodes={simNodes}
      layoutMode={layoutMode}
      simulation={simulation}
      linkRef={linkRef}
      nodeGroupRef={nodeGroupRef}
      hiddenNodeIds={hiddenNodeIds}
      setHiddenNodeIds={setHiddenNodeIds}
      setContextNodeId={setContextNodeId}
      setHoveredNodeId={setHoveredNodeId}
      // Pass edge context menu down
      onEdgeContextMenu={onEdgeContextMenu}
    />
  );
};

export default GraphD3SvgLayer;
