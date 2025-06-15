
import React, { useRef, useCallback } from "react";
import { useD3GraphState } from "@/hooks/useD3GraphState";
import GraphD3Toolbar from "./GraphD3Toolbar";
import GraphD3SvgLayer from "./GraphD3SvgLayer";
import GraphTooltipManager from "./GraphTooltipManager";

/**
 * This D3 graph canvas component now composes specialized pieces for simulation and rendering.
 */
const GraphD3Canvas: React.FC = () => {
  const {
    nodes,
    edges,
    updateNodes,
    updateEdges,
    clearManualPositions,
    saveManualPosition,
    manualPositions,
    setManualPositions,
    captureSimulationPositions,
    getLastSimulationPositions,
  } = useD3GraphState();

  const [layoutMode, setLayoutMode] = React.useState<"simulation" | "manual">("simulation");
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);
  const [contextNodeId, setContextNodeId] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState<null | { id: string; offsetX: number; offsetY: number }>(null);
  const [hiddenNodeIds, setHiddenNodeIds] = React.useState<Set<string>>(new Set());

  // Filtering logic
  const filteredNodes = React.useMemo(
    () => nodes.filter((n) => !hiddenNodeIds.has(n.id)),
    [nodes, hiddenNodeIds]
  );
  const filteredNodeIds = React.useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);
  const filteredEdges = React.useMemo(
    () => edges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)),
    [edges, filteredNodeIds]
  );
  const hoveredNode = nodes.find((n) => n.id === hoveredNodeId);

  // Keyboard shortcuts for hiding
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
        setHiddenNodeIds(new Set());
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && contextNodeId) {
        setContextNodeId(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [contextNodeId]);

  // Enhanced mode switching with position preservation
  const handleSetLayoutMode = useCallback(
    (mode: "simulation" | "manual") => {
      if (mode === "manual" && layoutMode === "simulation") {
        // Capture current simulation positions and set them as manual positions
        const simPositions = getLastSimulationPositions();
        console.log("Switching to manual mode, captured positions:", simPositions);
        if (Object.keys(simPositions).length > 0) {
          setManualPositions(simPositions);
        }
      }
      setLayoutMode(mode);
    },
    [layoutMode, getLastSimulationPositions, setManualPositions]
  );

  return (
    <div className="relative w-full h-[70vh] bg-background border rounded-lg overflow-hidden shadow-lg">
      <GraphD3Toolbar
        layoutMode={layoutMode}
        setLayoutMode={handleSetLayoutMode}
        onShowAllHidden={() => setHiddenNodeIds(new Set())}
      />
      <GraphD3SvgLayer
        nodes={filteredNodes}
        edges={filteredEdges}
        layoutMode={layoutMode}
        manualPositions={manualPositions}
        setManualPositions={setManualPositions}
        saveManualPosition={saveManualPosition}
        hiddenNodeIds={hiddenNodeIds}
        setHiddenNodeIds={setHiddenNodeIds}
        setHoveredNodeId={setHoveredNodeId}
        setContextNodeId={setContextNodeId}
        dragging={dragging}
        setDragging={setDragging}
        captureSimulationPositions={captureSimulationPositions}
      />
      {contextNodeId && (
        <div className="fixed z-50 left-36 top-32 pointer-events-none"></div>
      )}
      <GraphTooltipManager node={hoveredNode} />
    </div>
  );
};

export default GraphD3Canvas;
