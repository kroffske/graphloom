
import React, { useRef } from "react";
import { useD3Layout } from "@/hooks/useD3Layout";
import { useD3SvgGraph, WIDTH, HEIGHT } from "@/hooks/useD3SvgGraph";
import GraphD3EdgeLayer from "./GraphD3EdgeLayer";
import GraphD3NodeLayer from "./GraphD3NodeLayer";
import { useGraphStore } from "@/state/useGraphStore";

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

  const { selectEdge } = useGraphStore();

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

  // Refactored to custom hook for D3 SVG graph rendering
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

  function handleBackgroundPointerDown(ev: React.MouseEvent) {
    if (!ev.shiftKey && !ev.ctrlKey && !ev.metaKey) {
      selectEdge(null);
    }
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        background: "none",
        padding: 0,
        margin: 0,
      }}
      aria-label="Graph Visualization"
      tabIndex={0}
      onPointerDown={handleBackgroundPointerDown}
    >
      <GraphD3EdgeLayer
        edges={simEdges}
        nodes={simNodes}
        useDynamic={layoutMode === "force"}
        simulation={simulation}
        linkRef={linkRef}
      />
      <GraphD3NodeLayer
        simNodes={simNodes}
        nodeGroupRef={nodeGroupRef}
        hiddenNodeIds={hiddenNodeIds}
        setHiddenNodeIds={setHiddenNodeIds}
        setContextNodeId={setContextNodeId}
        setHoveredNodeId={setHoveredNodeId}
        onNodeKeydown={undefined}
      />
    </svg>
  );
};

export default GraphD3SvgLayer;
