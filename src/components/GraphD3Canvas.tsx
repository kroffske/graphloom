import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import { useGraphStore } from "@/state/useGraphStore";
import GraphD3Node from "./GraphD3Node";
import GraphTooltipManager from "./GraphTooltipManager";
import GraphNodeContextMenu from "./GraphNodeContextMenu";
import { Button } from "@/components/ui/button";
/**
 * This D3 graph canvas component handles force-directed layout, zoom/pan, and events.
 * It integrates with your Zustand store and coordinates tooltip hover/selection.
 */
const NODE_RADIUS = 36; // Size matches previous minWidth in px
const EDGE_COLOR = "#64748b";
const WIDTH = 900;
const HEIGHT = 530;

type D3SimNode = {
  id: string;
  type: string;
  label: string;
  attributes: Record<string, string | number | boolean>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
};

type D3SimEdge = {
  id: string;
  source: string;
  target: string;
  type?: string;
};

const GraphD3Canvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const {
    nodes,
    edges,
    selectedNodeId,
    selectNode,
    hiddenNodeIds,
    hideNode,
    showNode,
    showAllHiddenNodes,
    manualPositions,
    setManualPosition,
  } = useGraphStore();
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);

  // Manual/Simulation mode
  const [layoutMode, setLayoutMode] = React.useState<"simulation" | "manual">("simulation");
  // Used for context menu: which node/menu is active
  const [contextNodeId, setContextNodeId] = React.useState<string | null>(null);

  // Local drag state for manual mode
  const [dragging, setDragging] = React.useState<null | { id: string; offsetX: number; offsetY: number }> (null);

  // Sim state refs so we can use in D3 handlers
  const hoveredNodeIdRef = useRef<string | null>(null);
  hoveredNodeIdRef.current = hoveredNodeId;
  const selectNodeRef = useRef(selectNode);
  selectNodeRef.current = selectNode;

  const filteredNodes = React.useMemo(() => nodes.filter((n) => !hiddenNodeIds.has(n.id)), [nodes, hiddenNodeIds]);
  const filteredNodeIds = React.useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);
  const filteredEdges = React.useMemo(
    () => edges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)),
    [edges, filteredNodeIds]
  );
  // Tooltip logic
  const hoveredNode = nodes.find((n) => n.id === hoveredNodeId);

  // D3 Simulation
  useEffect(() => {
    if (!svgRef.current) return;
    if (!filteredNodes.length) return;

    // Deep copy to avoid D3 mutating state
    const simNodes: D3SimNode[] = filteredNodes.map((n) => {
      // In manual mode, override xy with saved manualPositions
      if (layoutMode === "manual" && manualPositions[n.id]) {
        return { ...n, ...manualPositions[n.id] };
      }
      return { ...n };
    });
    const simEdges: D3SimEdge[] = filteredEdges.map((e) => ({ ...e }));

    // Prepare simulation
    const simulation = d3
      .forceSimulation(simNodes)
      .force(
        "link",
        d3.forceLink(simEdges).id((d: any) => d.id).distance(120).strength(0.6)
      )
      .force("charge", d3.forceManyBody().strength(-370))
      .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("collision", d3.forceCollide(NODE_RADIUS + 12));
    // In manual mode, freeze simulation
    if (layoutMode === "manual") {
      simulation.alpha(0).alphaTarget(0).stop();
    }

    // Select SVG, clear contents
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Add zoom/pan behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.25, 1.75]).on("zoom", (event) => {
      svgGroup.attr("transform", event.transform);
    });
    svg.call(zoom as any);

    // Create main group
    const svgGroup = svg.append("g");

    // Draw edges
    const link = svgGroup
      .selectAll("line")
      .data(simEdges)
      .enter()
      .append("line")
      .attr("stroke", EDGE_COLOR)
      .attr("stroke-width", 2)
      .attr("opacity", 0.7);

    // Draw nodes as group so we can overlay custom React components
    const nodeLayer = svgGroup.append("g").attr("class", "nodes");
    const nodeG = nodeLayer
      .selectAll("g")
      .data(simNodes)
      .enter()
      .append("g")
      .attr("cursor", "pointer")
      .attr("tabindex", 0);

    // Dummy base circle for native D3 events (hit region)
    nodeG
      .append("circle")
      .attr("r", NODE_RADIUS * 0.8)
      .attr("fill", "#fff")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .style("opacity", 0.01); // Only for hit area

    // Add vanilla DOM for overlay (React render)
    nodeG
      .append("foreignObject")
      .attr("width", NODE_RADIUS * 2)
      .attr("height", NODE_RADIUS * 2)
      .attr("x", -NODE_RADIUS)
      .attr("y", -NODE_RADIUS)
      .append("xhtml:div")
      .attr("style", "display: flex;justify-content:center;align-items:center;width:100%;height:100%;")
      .html((d) => `<div id="d3-node-${d.id}"></div>`);

    // === Node Events ===

    // Manual drag logic for "Manual" mode
    if (layoutMode === "manual") {
      nodeG.call(
        d3
          .drag<SVGGElement, D3SimNode>()
          .on("start", function (event, d) {
            setDragging({
              id: d.id,
              offsetX: event.x - (manualPositions[d.id]?.x ?? d.x ?? 0),
              offsetY: event.y - (manualPositions[d.id]?.y ?? d.y ?? 0),
            });
          })
          .on("drag", function (event, d) {
            // Only update this node's visual
            const moved = { x: event.x, y: event.y };
            d3.select(this).attr("transform", `translate(${moved.x},${moved.y})`);

            // Move incident edges visually as well (live update)
            link.each(function (l: any) {
              if (l.source.id === d.id) {
                d3.select(this)
                  .attr("x1", moved.x)
                  .attr("y1", moved.y);
              } else if (l.target.id === d.id) {
                d3.select(this)
                  .attr("x2", moved.x)
                  .attr("y2", moved.y);
              }
            });
          })
          .on("end", function (event, d) {
            setDragging(null);
            setManualPosition(d.id, { x: event.x, y: event.y });
          })
      );
    } else {
      // Simulation mode: restore simulation (drag handled by D3)
      // D3 simulation already enabled by default; do not drag manually here
    }

    // Mouse events
    nodeG
      .on("mouseenter", (_event, d) => setHoveredNodeId(d.id))
      .on("mouseleave", () => setHoveredNodeId(null))
      .on("click", (_event, d) => {
        selectNodeRef.current(d.id);
      })
      .on("contextmenu", function (event, d) {
        event.preventDefault();
        setContextNodeId(d.id);
      });

    // Keyboard focus/selection (plus Shift+F10 for menu, elsewhere)
    nodeG.on("keydown", function (event, d) {
      if (event.key === "Enter" || event.key === " ") {
        selectNodeRef.current(d.id);
      }
      if (
        ((event.shiftKey && event.key === "F10") || event.key === "ContextMenu" || event.key === "Apps")
      ) {
        setContextNodeId(d.id);
      }
      // Keyboard move in manual mode (arrow keys)
      if (layoutMode === "manual" && (event.key.startsWith("Arrow"))) {
        event.preventDefault();
        const { x = d.x ?? 0, y = d.y ?? 0 } = manualPositions[d.id] || d;
        let step = event.shiftKey ? 1 : 10;
        let nx = x, ny = y;
        if (event.key === "ArrowUp") ny -= step;
        if (event.key === "ArrowDown") ny += step;
        if (event.key === "ArrowLeft") nx -= step;
        if (event.key === "ArrowRight") nx += step;
        setManualPosition(d.id, { x: nx, y: ny });
      }
    });

    // Integrate React into D3 for the actual node visuals and wrap with right-click context menu
    setTimeout(() => {
      simNodes.forEach((n) => {
        const mountPoint = document.getElementById(`d3-node-${n.id}`);
        if (mountPoint) {
          import("react-dom/client").then((ReactDOMClient) => {
            ReactDOMClient.createRoot(mountPoint).render(
              <GraphNodeContextMenu
                nodeId={n.id}
                isHidden={!!hiddenNodeIds.has(n.id)}
                onHide={() => hideNode(n.id)}
                onExpand={() => showNode(n.id)}
              >
                <GraphD3Node
                  node={n}
                  selected={selectedNodeId === n.id}
                  onSelect={selectNode}
                />
              </GraphNodeContextMenu>
            );
          });
        }
      });
    }, 0);

    // Simulation tick: update positions
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => (d.source as D3SimNode).x!)
        .attr("y1", (d: any) => (d.source as D3SimNode).y!)
        .attr("x2", (d: any) => (d.target as D3SimNode).x!)
        .attr("y2", (d: any) => (d.target as D3SimNode).y!);

      nodeG.attr("transform", (d: any) =>
        `translate(${d.x},${d.y})`
      );
    });

    // Clean up simulation on unmount
    return () => {
      simulation.stop();
    };
  }, [
    nodes,
    edges,
    filteredNodes,
    filteredEdges,
    selectedNodeId,
    selectNode,
    hiddenNodeIds,
    layoutMode,
    manualPositions,
    setManualPosition,
    dragging,
    hideNode,
    showNode,
    // contextNodeId is not used here
  ]);

  // Keyboard batch unhide hotkey ("U" releases all hidden)
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
        showAllHiddenNodes();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showAllHiddenNodes]);

  // Accessibility: allow context menu to be closed with Esc
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && contextNodeId) {
        setContextNodeId(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [contextNodeId]);

  return (
    <div className="relative w-full h-[70vh] bg-background border rounded-lg overflow-hidden shadow-lg">
      {/* Toolbar: Layout/Manual switch, Show All Hidden */}
      <div className="flex gap-3 items-center px-3 py-1 absolute z-10 bg-muted left-2 top-2 rounded shadow">
        <Button
          size="sm"
          variant={layoutMode === "simulation" ? "default" : "outline"}
          onClick={() => setLayoutMode("simulation")}
        >
          Layout Mode
        </Button>
        <Button
          size="sm"
          variant={layoutMode === "manual" ? "default" : "outline"}
          onClick={() => setLayoutMode("manual")}
        >
          Manual Mode
        </Button>
        <Button size="sm" onClick={showAllHiddenNodes}>
          Show All Hidden
        </Button>
      </div>
      {/* SVG Graph */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ minWidth: WIDTH, minHeight: HEIGHT, width: "100%", height: "100%", background: "none" }}
        aria-label="Graph Visualization"
        tabIndex={0}
      />
      {/* Render context menu at virtual pos for keyboard if required */}
      {contextNodeId && (
        <div className="fixed z-50 left-36 top-32 pointer-events-none"></div>
      )}
      <GraphTooltipManager node={hoveredNode} />
    </div>
  );
};

export default GraphD3Canvas;
