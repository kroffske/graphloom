
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import GraphD3Node from "./GraphD3Node";
import GraphNodeContextMenu from "./GraphNodeContextMenu";
import { useD3ZoomAndPan } from "@/hooks/useD3ZoomAndPan";
import { useD3DragNodes } from "@/hooks/useD3DragNodes";
import { useSimLayoutCapture } from "@/hooks/useSimLayoutCapture";

type GraphD3SvgLayerProps = {
  nodes: any[];
  edges: any[];
  layoutMode: "simulation" | "manual";
  manualPositions: Record<string, { x: number; y: number }>;
  setManualPositions: (v: any) => void;
  saveManualPosition: (id: string, pos: { x: number; y: number }) => void;
  hiddenNodeIds: Set<string>;
  setHiddenNodeIds: (s: Set<string>) => void;
  setHoveredNodeId: (id: string | null) => void;
  setContextNodeId: (id: string | null) => void;
  dragging: any;
  setDragging: (d: any) => void;
};

const NODE_RADIUS = 36;
const EDGE_COLOR = "#64748b";
const WIDTH = 900;
const HEIGHT = 530;

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
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  // Extracted layout capture logic
  const { capturePositions } = useSimLayoutCapture();
  const lastSimPositionsRef = useRef<Record<string, { x: number; y: number }>>({});

  // Main D3 draw/logic
  useEffect(() => {
    if (!svgRef.current || !nodes.length) return;

    const simNodes = nodes.map((n) => {
      if (layoutMode === "manual" && manualPositions[n.id]) {
        return { ...n, ...manualPositions[n.id] };
      }
      return { ...n };
    });
    const simEdges = edges.map((e) => ({ ...e }));

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

    // SVG clear
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create group for zoom/pan
    const svgGroup = svg.append("g");
    // Zoom/pan hook
    useD3ZoomAndPan({ svgRef, svgGroup });

    // Edges
    const link = svgGroup
      .selectAll("line")
      .data(simEdges)
      .enter()
      .append("line")
      .attr("stroke", EDGE_COLOR)
      .attr("stroke-width", 2)
      .attr("opacity", 0.7);

    // Nodes
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

    // Drag/Manual Layout
    useD3DragNodes({
      nodeG,
      link,
      layoutMode,
      manualPositions,
      setDragging,
      saveManualPosition,
    });

    nodeG
      .on("mouseenter", (_event, d) => setHoveredNodeId(d.id))
      .on("mouseleave", () => setHoveredNodeId(null))
      .on("click", (_event, d) => { /* selection logic, not needed here */ })
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
      capturePositions(simNodes);

      // Store last simulation positions for manual mode switch
      const result: Record<string, { x: number; y: number }> = {};
      simNodes.forEach((n: any) => {
        if (typeof n.id === "string" && typeof n.x === "number" && typeof n.y === "number") {
          result[n.id] = { x: n.x, y: n.y };
        }
      });
      lastSimPositionsRef.current = result;

      link
        .attr("x1", (d: any) => (d.source as any).x!)
        .attr("y1", (d: any) => (d.source as any).y!)
        .attr("x2", (d: any) => (d.target as any).x!)
        .attr("y2", (d: any) => (d.target as any).y!);

      nodeG.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [
    nodes,
    edges,
    layoutMode,
    manualPositions,
    setDragging,
    saveManualPosition,
    hiddenNodeIds,
    setHiddenNodeIds,
    setHoveredNodeId,
    setContextNodeId,
    dragging,
    capturePositions,
  ]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ minWidth: WIDTH, minHeight: HEIGHT, width: "100%", height: "100%", background: "none" }}
      aria-label="Graph Visualization"
      tabIndex={0}
    />
  );
};

export default GraphD3SvgLayer;
