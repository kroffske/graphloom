
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
  setContextNodeId: (id: string | null) => void;
  dragging: any;
  setDragging: (d: any) => void;
  captureSimulationPositions: (simNodes: any[]) => void;
  initialPositions?: Record<string, { x: number; y: number }>;
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
    setContextNodeId,
    dragging,
    setDragging,
    captureSimulationPositions,
    initialPositions,
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
    setContextNodeId,
    dragging,
    setDragging,
    captureSimulationPositions,
    initialPositions,
    simulation,
    simNodes,
    simEdges,
  });

  // This layer now only wires together data/components
  return (
    <GraphD3SvgFrame
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
    />
  );
};

export default GraphD3SvgLayer;
