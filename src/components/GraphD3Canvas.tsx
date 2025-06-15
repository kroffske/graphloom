import React, { useRef, useCallback, useState } from "react";
import { useD3GraphState } from "@/hooks/useD3GraphState";
import GraphD3Toolbar from "./GraphD3Toolbar";
import GraphD3SvgLayer from "./GraphD3SvgLayer";
import GraphTooltipManager from "./GraphTooltipManager";
import EdgeContextMenu from "./EdgeContextMenu";
import { useGraphStore } from "@/state/useGraphStore";
import EdgeTooltip from "./EdgeTooltip";

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

  // layoutMode now supports: "force", "circle", "hierarchy", "manual"
  const [layoutMode, setLayoutMode] = React.useState<"force" | "circle" | "hierarchy" | "manual">("force");
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);
  const [contextNodeId, setContextNodeId] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState<null | { id: string; offsetX: number; offsetY: number }>(null);
  const [hiddenNodeIds, setHiddenNodeIds] = React.useState<Set<string>>(new Set());

  // NEW: Edge hover state and mouse position for tooltip
  const [hoveredEdgeId, setHoveredEdgeId] = React.useState<string | null>(null);
  const [edgeMousePos, setEdgeMousePos] = React.useState<{ x: number; y: number } | null>(null);

  // NEW: Edge context menu state
  const [edgeMenu, setEdgeMenu] = useState<{ edgeId: string; x: number; y: number } | null>(null);

  // Positions ref for D3 force/visible nodes
  const lastSimPositionsRef = useRef<Record<string, { x: number; y: number }>>({});

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

  // Store simulation positions on each tick (via GraphD3SvgLayer's callback)
  const handleCaptureSimulationPositions = useCallback(
    (simNodes: any[]) => {
      // Only update positions for visible nodes
      const pos: Record<string, { x: number; y: number }> = {};
      simNodes.forEach((n: any) => {
        if (typeof n.x === "number" && typeof n.y === "number") {
          pos[n.id] = { x: n.x, y: n.y };
        }
      });
      lastSimPositionsRef.current = pos;
      // Also call main state capture if needed
      captureSimulationPositions(simNodes);
    },
    [captureSimulationPositions]
  );

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
      if (e.key === "Escape" && (contextNodeId || edgeMenu)) {
        setContextNodeId(null);
        setEdgeMenu(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [contextNodeId, edgeMenu]);

  // Enhanced mode switching with position preservation
  const handleSetLayoutMode = useCallback(
    (mode: "force" | "circle" | "hierarchy" | "manual") => {
      if (mode === "manual" && layoutMode !== "manual") {
        // Capture current positions and set them as manual positions
        const simPositions = lastSimPositionsRef.current;
        if (Object.keys(simPositions).length > 0) {
          setManualPositions(simPositions);
        }
      }
      setLayoutMode(mode);
    },
    [layoutMode, setManualPositions]
  );

  // PREVENT LAYOUT RESET: store last positions of visible nodes on hide/show
  // When nodes/edges or hiddenNodeIds changes, always inject last positions for force layout

  // Save a snapshot of the last visible node positions for seeding D3 force sim
  // Pass this on to useD3Layout as 'initialPositions' (only for force mode!)
  const d3InitialPositions = React.useMemo(() => {
    // Only for filtered nodes (those being displayed)
    const result: Record<string, { x: number; y: number }> = {};
    filteredNodes.forEach((n) => {
      // Try our ref, then the node's own x/y (in case reloaded)
      if (lastSimPositionsRef.current[n.id]) {
        result[n.id] = lastSimPositionsRef.current[n.id];
      } else if (typeof n.x === "number" && typeof n.y === "number") {
        result[n.id] = { x: n.x, y: n.y };
      }
    });
    return result;
  }, [filteredNodes]);

  // Get selectEdge from store
  const { selectEdge } = useGraphStore();

  // NEW: select edge before showing context menu
  const handleEdgeContextMenu = React.useCallback(
    (edgeId: string, event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      // Select edge before showing menu
      selectEdge(edgeId);
      let clientX = (event as MouseEvent).clientX;
      let clientY = (event as MouseEvent).clientY;
      setEdgeMenu({ edgeId, x: clientX, y: clientY });
    },
    [selectEdge]
  );

  // Find the currently hovered edge, if any
  const hoveredEdge = edges.find(e => e.id === hoveredEdgeId);

  return (
    <div className="relative w-full h-full flex-1 bg-background border rounded-lg overflow-hidden shadow-lg p-0 m-0" style={{ minHeight: 0, minWidth: 0 }}>
      <GraphD3Toolbar
        layoutMode={layoutMode}
        setLayoutMode={handleSetLayoutMode}
        onShowAllHidden={() => setHiddenNodeIds(new Set())}
      />
      <div className="w-full h-full flex-1" style={{ minHeight: 0, minWidth: 0 }}>
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
          captureSimulationPositions={handleCaptureSimulationPositions}
          initialPositions={layoutMode === "force" ? d3InitialPositions : undefined}
          // Pass edge context menu handler
          onEdgeContextMenu={handleEdgeContextMenu}
          // Pass hover handlers for edges:
          setHoveredEdgeId={setHoveredEdgeId}
          setEdgeMousePos={setEdgeMousePos}
        />
      </div>
      {edgeMenu && (
        <EdgeContextMenu
          edgeId={edgeMenu.edgeId}
          x={edgeMenu.x}
          y={edgeMenu.y}
          onClose={() => setEdgeMenu(null)}
        />
      )}
      {contextNodeId && (
        <div className="fixed z-50 left-36 top-32 pointer-events-none"></div>
      )}
      {/* Node tooltip */}
      <GraphTooltipManager node={hoveredNode} />
      {/* Edge tooltip */}
      <EdgeTooltip edge={hoveredEdge} position={edgeMousePos} />
    </div>
  );
};

export default GraphD3Canvas;
