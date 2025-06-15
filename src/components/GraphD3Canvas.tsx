
import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import { useD3GraphState } from "@/hooks/useD3GraphState";
import GraphD3Node from "./GraphD3Node";
import GraphTooltipManager from "./GraphTooltipManager";
import GraphNodeContextMenu from "./GraphNodeContextMenu";
import { Button } from "@/components/ui/button";

/**
 * This D3 graph canvas component handles force-directed layout, zoom/pan, and events.
 * It now relies on useD3GraphState hook for state & diff logic.
 */
const NODE_RADIUS = 36;
const EDGE_COLOR = "#64748b";
const WIDTH = 900;
const HEIGHT = 530;

const GraphD3Canvas: React.FC = () => {
  // Use new stateful D3 sync hook for updates/diff/state preservation
  const {
    nodes,
    edges,
    updateNodes,
    updateEdges,
    clearManualPositions,
    saveManualPosition,
    manualPositions,
  } = useD3GraphState();

  const [layoutMode, setLayoutMode] = React.useState<"simulation" | "manual">("simulation");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);
  const [contextNodeId, setContextNodeId] = React.useState<string | null>(null);

  // Local drag state for manual mode
  const [dragging, setDragging] = React.useState<null | { id: string; offsetX: number; offsetY: number }>(null);

  // Filtered node/edge data
  const [hiddenNodeIds, setHiddenNodeIds] = React.useState<Set<string>>(new Set());
  const filteredNodes = React.useMemo(
    () => nodes.filter((n) => !hiddenNodeIds.has(n.id)),
    [nodes, hiddenNodeIds]
  );
  const filteredNodeIds = React.useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);
  const filteredEdges = React.useMemo(
    () => edges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)),
    [edges, filteredNodeIds]
  );
  const hoveredNode = nodes.find((n) => n.id === hoveredNodeId);

  // Keyboard: batch unhide
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
        setHiddenNodeIds(new Set());
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Accessibility: context menu close with Esc
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && contextNodeId) {
        setContextNodeId(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [contextNodeId]);

  // D3 Simulation & SVG Rendering
  useEffect(() => {
    if (!svgRef.current) return;
    if (!filteredNodes.length) return;

    // Deep copy nodes, preserve manualPositions in manual mode
    const simNodes = filteredNodes.map((n) => {
      if (layoutMode === "manual" && manualPositions[n.id]) {
        return { ...n, ...manualPositions[n.id] };
      }
      return { ...n };
    });
    const simEdges = filteredEdges.map((e) => ({ ...e }));

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

    if (layoutMode === "manual") {
      simulation.alpha(0).alphaTarget(0).stop();
    }

    // Select SVG, clear contents
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Zoom/pan
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.25, 1.75]).on("zoom", (event) => {
      svgGroup.attr("transform", event.transform);
    });
    svg.call(zoom as any);

    const svgGroup = svg.append("g");

    const link = svgGroup
      .selectAll("line")
      .data(simEdges)
      .enter()
      .append("line")
      .attr("stroke", EDGE_COLOR)
      .attr("stroke-width", 2)
      .attr("opacity", 0.7);

    const nodeLayer = svgGroup.append("g").attr("class", "nodes");
    const nodeG = nodeLayer
      .selectAll("g")
      .data(simNodes)
      .enter()
      .append("g")
      .attr("cursor", "pointer")
      .attr("tabindex", 0);

    nodeG
      .append("circle")
      .attr("r", NODE_RADIUS * 0.8)
      .attr("fill", "#fff")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .style("opacity", 0.01);

    nodeG
      .append("foreignObject")
      .attr("width", NODE_RADIUS * 2)
      .attr("height", NODE_RADIUS * 2)
      .attr("x", -NODE_RADIUS)
      .attr("y", -NODE_RADIUS)
      .append("xhtml:div")
      .attr("style", "display: flex;justify-content:center;align-items:center;width:100%;height:100%;")
      .html((d) => `<div id="d3-node-${d.id}"></div>`);

    if (layoutMode === "manual") {
      nodeG.call(
        d3
          .drag<SVGGElement, any>()
          .on("start", function (event, d) {
            setDragging({
              id: d.id,
              offsetX: event.x - (manualPositions[d.id]?.x ?? d.x ?? 0),
              offsetY: event.y - (manualPositions[d.id]?.y ?? d.y ?? 0),
            });
          })
          .on("drag", function (event, d) {
            const moved = { x: event.x, y: event.y };
            d3.select(this).attr("transform", `translate(${moved.x},${moved.y})`);
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
            saveManualPosition(d.id, { x: event.x, y: event.y });
          })
      );
    }

    nodeG
      .on("mouseenter", (_event, d) => setHoveredNodeId(d.id))
      .on("mouseleave", () => setHoveredNodeId(null))
      .on("click", (_event, d) => {
        // selection logic, could be setNodeSelected in state if needed
      })
      .on("contextmenu", function (event, d) {
        event.preventDefault();
        setContextNodeId(d.id);
      });

    nodeG.on("keydown", function (event, d) {
      if (event.key === "Enter" || event.key === " ") {
        // selection logic
      }
      if (
        ((event.shiftKey && event.key === "F10") || event.key === "ContextMenu" || event.key === "Apps")
      ) {
        setContextNodeId(d.id);
      }
      if (layoutMode === "manual" && (event.key.startsWith("Arrow"))) {
        event.preventDefault();
        const { x = d.x ?? 0, y = d.y ?? 0 } = manualPositions[d.id] || d;
        let step = event.shiftKey ? 1 : 10;
        let nx = x, ny = y;
        if (event.key === "ArrowUp") ny -= step;
        if (event.key === "ArrowDown") ny += step;
        if (event.key === "ArrowLeft") nx -= step;
        if (event.key === "ArrowRight") nx += step;
        saveManualPosition(d.id, { x: nx, y: ny });
      }
    });

    setTimeout(() => {
      simNodes.forEach((n) => {
        const mountPoint = document.getElementById(`d3-node-${n.id}`);
        if (mountPoint) {
          import("react-dom/client").then((ReactDOMClient) => {
            ReactDOMClient.createRoot(mountPoint).render(
              <GraphNodeContextMenu
                nodeId={n.id}
                isHidden={!!hiddenNodeIds.has(n.id)}
                onHide={() => setHiddenNodeIds(new Set([...hiddenNodeIds, n.id]))}
                onExpand={() => {
                  const s = new Set(hiddenNodeIds);
                  s.delete(n.id);
                  setHiddenNodeIds(new Set(s));
                }}
              >
                <GraphD3Node
                  node={n}
                  selected={false}
                />
              </GraphNodeContextMenu>
            );
          });
        }
      });
    }, 0);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => (d.source as any).x!)
        .attr("y1", (d: any) => (d.source as any).y!)
        .attr("x2", (d: any) => (d.target as any).x!)
        .attr("y2", (d: any) => (d.target as any).y!);

      nodeG.attr("transform", (d: any) =>
        `translate(${d.x},${d.y})`
      );
    });

    return () => {
      simulation.stop();
    };
  }, [
    nodes,
    edges,
    filteredNodes,
    filteredEdges,
    layoutMode,
    manualPositions,
    dragging,
    saveManualPosition,
    hiddenNodeIds,
  ]);

  // UI
  return (
    <div className="relative w-full h-[70vh] bg-background border rounded-lg overflow-hidden shadow-lg">
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
        <Button size="sm" onClick={() => setHiddenNodeIds(new Set())}>
          Show All Hidden
        </Button>
      </div>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ minWidth: WIDTH, minHeight: HEIGHT, width: "100%", height: "100%", background: "none" }}
        aria-label="Graph Visualization"
        tabIndex={0}
      />
      {contextNodeId && (
        <div className="fixed z-50 left-36 top-32 pointer-events-none"></div>
      )}
      <GraphTooltipManager node={hoveredNode} />
    </div>
  );
};

export default GraphD3Canvas;

