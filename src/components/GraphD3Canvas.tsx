
import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import { useGraphStore } from "@/state/useGraphStore";
import GraphD3Node from "./GraphD3Node";
import GraphTooltipManager from "./GraphTooltipManager";

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
  const { nodes, edges, selectedNodeId, selectNode } = useGraphStore();
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);

  // Sim state refs so we can use in D3 handlers
  const hoveredNodeIdRef = useRef<string | null>(null);
  hoveredNodeIdRef.current = hoveredNodeId;
  const selectNodeRef = useRef(selectNode);
  selectNodeRef.current = selectNode;

  // Tooltip logic
  const hoveredNode = nodes.find((n) => n.id === hoveredNodeId);

  // D3 Simulation
  useEffect(() => {
    if (!svgRef.current) return;
    if (!nodes.length) return;

    // Deep copy to avoid D3 mutating state
    const simNodes: D3SimNode[] = nodes.map((n) => ({ ...n }));
    const simEdges: D3SimEdge[] = edges.map((e) => ({ ...e }));

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

    // Mouse events
    nodeG
      .on("mouseenter", (_event, d) => setHoveredNodeId(d.id))
      .on("mouseleave", () => setHoveredNodeId(null))
      .on("click", (_event, d) => {
        selectNodeRef.current(d.id);
      });

    // Keyboard focus/selection
    nodeG.on("keydown", function (event, d) {
      if (event.key === "Enter" || event.key === " ") {
        selectNodeRef.current(d.id);
      }
    });

    // Integrate React into D3 for the actual node visuals
    setTimeout(() => {
      simNodes.forEach((n) => {
        const mountPoint = document.getElementById(`d3-node-${n.id}`);
        if (mountPoint) {
          // Mount or replace with React component
          import("react-dom").then((ReactDOM) => {
            ReactDOM.createRoot(mountPoint).render(
              <GraphD3Node
                node={n}
                selected={selectedNodeId === n.id}
                onSelect={selectNode}
              />
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

      nodeG.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Clean up simulation on unmount
    return () => {
      simulation.stop();
    };
  }, [nodes, edges, selectedNodeId, selectNode]);

  return (
    <div className="relative w-full h-[70vh] bg-background border rounded-lg overflow-hidden shadow-lg">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ minWidth: WIDTH, minHeight: HEIGHT, width: "100%", height: "100%", background: "none" }}
        aria-label="Graph Visualization"
        tabIndex={0}
      />
      <GraphTooltipManager node={hoveredNode} />
    </div>
  );
};

export default GraphD3Canvas;
