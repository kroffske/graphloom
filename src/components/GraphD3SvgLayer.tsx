import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useD3DragNodes } from "@/hooks/useD3DragNodes";
import { d3LayoutForce } from "@/utils/d3LayoutForce";
import { d3LayoutCircle } from "@/utils/d3LayoutCircle";
import { d3LayoutHierarchy } from "@/utils/d3LayoutHierarchy";
import GraphD3NodeMount from "./GraphD3NodeMount";

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
};

const NODE_RADIUS = 36;
const EDGE_COLOR = "#64748b";
const WIDTH = 900;
const HEIGHT = 530;

// Helper: return equally spaced fallback positions for manual mode.
function getFallbackXY(idx: number, total: number) {
  // Place nodes in grid if no position info (simple, predictable)
  const perRow = Math.ceil(Math.sqrt(total));
  const spacingX = WIDTH / (perRow + 1);
  const spacingY = HEIGHT / (perRow + 1);
  const x = spacingX * (1 + (idx % perRow));
  const y = spacingY * (1 + Math.floor(idx / perRow));
  return { x, y };
}

// Helper: choose layout
function computeLayout(
  mode: "force" | "circle" | "hierarchy" | "manual",
  nodes: any[],
  edges: any[],
  manualPositions: Record<string, { x: number; y: number }> // add manualPositions here
) {
  if (mode === "force") {
    return d3LayoutForce(nodes, edges, NODE_RADIUS, WIDTH, HEIGHT);
  } else if (mode === "circle") {
    return d3LayoutCircle(nodes, edges, WIDTH, HEIGHT);
  } else if (mode === "hierarchy") {
    return d3LayoutHierarchy(nodes, edges, WIDTH, HEIGHT);
  } else if (mode === "manual") {
    // Use manualPositions if possible; fallback to provided node positions; fallback to grid.
    const total = nodes.length;
    const simNodes = nodes.map((n, i) => {
      if (manualPositions[n.id]) {
        return { ...n, ...manualPositions[n.id] };
      } else if (typeof n.x === "number" && typeof n.y === "number") {
        return { ...n, x: n.x, y: n.y };
      } else {
        const xy = getFallbackXY(i, total);
        return { ...n, ...xy };
      }
    });
    const simEdges = edges.map((e) => ({ ...e }));
    return {
      simulation: { on: () => {}, stop: () => {} },
      simNodes,
      simEdges,
    };
  }
  // fallback
  return d3LayoutForce(nodes, edges, NODE_RADIUS, WIDTH, HEIGHT);
}

// ------------------- START COMPONENT -----------------------
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
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !nodes.length) return;

    // For manual mode: always pre-merge manual and fallback positions:
    // We now let computeLayout handle this.
    const mergedNodes = nodes; // do not pre-merge, just forward

    // Pick layout function with manualPositions as argument
    const { simulation, simNodes, simEdges } = computeLayout(
      layoutMode,
      mergedNodes,
      edges,
      manualPositions // pass down
    );

    // D3 element selection and clearing
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create group for zoom/pan and set up zoom
    const svgGroup = svg.append("g");
    const cleanupZoom = (() => {
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.25, 1.75])
        .on("zoom", (event) => {
          svgGroup.attr("transform", event.transform);
        });
      svg.call(zoom as any);
      return () => {
        svg.on(".zoom", null);
      };
    })();

    // Draw edges
    const link = svgGroup
      .selectAll("line")
      .data(simEdges)
      .enter()
      .append("line")
      .attr("stroke", EDGE_COLOR)
      .attr("stroke-width", 2)
      .attr("opacity", 0.7);

    // Draw nodes layer
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
      .attr(
        "style",
        "display: flex;justify-content:center;align-items:center;width:100%;height:100%;"
      )
      .html((d) => `<div id="d3-node-${d.id}"></div>`);

    // --- Drag/Manual Layout ---
    if (layoutMode === "manual") {
      useD3DragNodes({
        nodeG,
        link,
        layoutMode,
        manualPositions,
        setDragging,
        saveManualPosition,
      });
    } else if (layoutMode === "force") {
      // Add D3 drag for force mode: pin nodes by setting fx/fy, and allow drag motion
      nodeG.call(
        d3
          .drag<SVGGElement, any>()
          .on("start", function (event, d) {
            if (!event.active && simulation && simulation.alphaTarget) simulation.alphaTarget(0.3).restart();
            // On drag start, pin node at current position
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", function (event, d) {
            // Set .fx/.fy as user drags (pin to pointer)
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", function (event, d) {
            if (!event.active && simulation && simulation.alphaTarget) simulation.alphaTarget(0);
            // Node remains pinned at .fx/.fy after drag ends
            // If you want nodes to "unpin" after move, set d.fx = d.fy = null here, but default behavior is to keep pinned
          })
      );

      // Add double-click to "unpin" (release) node
      nodeG.on("dblclick", function (_event, d) {
        d.fx = null;
        d.fy = null;
        if (simulation && simulation.alphaTarget) simulation.alphaTarget(0.3).restart();
      });
    }

    // Node interactions (hover, context menu, keyboard)
    nodeG
      .on("mouseenter", (_event, d) => setHoveredNodeId(d.id))
      .on("mouseleave", () => setHoveredNodeId(null))
      .on("contextmenu", function (event, d) {
        event.preventDefault();
        setContextNodeId(d.id);
      });

    nodeG.on("keydown", function (event, d) {
      if (event.key === "Enter" || event.key === " ") {
        // selection logic
      }
      if (
        ((event.shiftKey && event.key === "F10") ||
          event.key === "ContextMenu" ||
          event.key === "Apps")
      ) {
        setContextNodeId(d.id);
      }
      if (
        layoutMode === "manual" &&
        event.key.startsWith("Arrow")
      ) {
        event.preventDefault();
        // keyboard nudge logic for manual mode
        // Always use manualPositions if present, fallback to d.x/d.y
        const manual = manualPositions[d.id];
        const x = manual?.x ?? d.x ?? 0;
        const y = manual?.y ?? d.y ?? 0;
        let step = event.shiftKey ? 1 : 10;
        let nx = x,
          ny = y;
        if (event.key === "ArrowUp") ny -= step;
        if (event.key === "ArrowDown") ny += step;
        if (event.key === "ArrowLeft") nx -= step;
        if (event.key === "ArrowRight") nx += step;
        saveManualPosition(d.id, { x: nx, y: ny });
      }
    });

    // Render React node with context menu with ReactDOMClient
    setTimeout(() => {
      simNodes.forEach((n) => {
        const mountPoint = document.getElementById(`d3-node-${n.id}`);
        if (mountPoint) {
          import("react-dom/client").then((ReactDOMClient) => {
            ReactDOMClient.createRoot(mountPoint).render(
              <GraphD3NodeMount
                node={n}
                hiddenNodeIds={hiddenNodeIds}
                setHiddenNodeIds={setHiddenNodeIds}
                setContextNodeId={setContextNodeId}
              />
            );
          });
        }
      });
    }, 0);

    // Only animate on "force" mode (tick for simulation)
    if (layoutMode === "force") {
      simulation.on("tick", () => {
        // Capture positions for mode switching
        captureSimulationPositions(simNodes);

        link
          .attr("x1", (d: any) => (d.source as any).x!)
          .attr("y1", (d: any) => (d.source as any).y!)
          .attr("x2", (d: any) => (d.target as any).x!)
          .attr("y2", (d: any) => (d.target as any).y!);

        nodeG.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      });
    } else {
      // For static layouts, just position nodes/edges once
      link
        .attr("x1", (d: any) => {
          const s: any = typeof d.source === "object" ? d.source : simNodes.find((n: any) => n.id === d.source);
          return s?.x ?? 0;
        })
        .attr("y1", (d: any) => {
          const s: any = typeof d.source === "object" ? d.source : simNodes.find((n: any) => n.id === d.source);
          return s?.y ?? 0;
        })
        .attr("x2", (d: any) => {
          const t: any = typeof d.target === "object" ? d.target : simNodes.find((n: any) => n.id === d.target);
          return t?.x ?? 0;
        })
        .attr("y2", (d: any) => {
          const t: any = typeof d.target === "object" ? d.target : simNodes.find((n: any) => n.id === d.target);
          return t?.y ?? 0;
        });

      nodeG.attr("transform", (d: any) => `translate(${d.x},${d.y})`);

      // For mode switching (e.g. manual, circle, hierarchy)
      captureSimulationPositions(simNodes);
    }

    // Cleanup: remove listeners, zoom and stop simulation
    return () => {
      cleanupZoom();
      simulation.stop && simulation.stop();
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
    captureSimulationPositions,
  ]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{
        minWidth: WIDTH,
        minHeight: HEIGHT,
        width: "100%",
        height: "100%",
        background: "none",
      }}
      aria-label="Graph Visualization"
      tabIndex={0}
    />
  );
};

export default GraphD3SvgLayer;

// --- 
// This file is getting quite long (over 200 lines).
// Consider asking Lovable to refactor it into smaller files for easier maintenance.
