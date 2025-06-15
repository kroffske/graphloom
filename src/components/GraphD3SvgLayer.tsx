import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useD3DragNodes } from "@/hooks/useD3DragNodes";
import { useD3ZoomAndPan } from "@/hooks/useD3ZoomAndPan";
import { useD3Layout } from "@/hooks/useD3Layout";
import GraphD3EdgeLayer from "./GraphD3EdgeLayer";
import GraphD3NodeLayer from "./GraphD3NodeLayer";
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

const WIDTH = 900;
const HEIGHT = 530;
const NODE_RADIUS = 36;

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
  const svgGroupRef = useRef<SVGGElement | null>(null);
  const linkRef = useRef<SVGGElement | null>(null);
  const nodeGroupRef = useRef<SVGGElement | null>(null);

  // Layout hook
  const { simulation, simNodes, simEdges } = useD3Layout(
    layoutMode,
    nodes,
    edges,
    manualPositions
  );

  // D3 rendering and behavior
  useEffect(() => {
    if (!svgRef.current || !simNodes.length) return;

    // D3 clear
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Main g for pan/zoom
    const svgGroup = svg.append("g");
    svgGroupRef.current = svgGroup.node() as SVGGElement;

    // Zoom behavior
    useD3ZoomAndPan({
      svgRef,
      svgGroup: svgGroupRef.current ? d3.select(svgGroupRef.current) : null,
    });

    // Edges group (keep order)
    const link = svgGroup.append("g").attr("class", "edges").selectAll("line")
      .data(simEdges)
      .enter()
      .append("line")
      .attr("stroke", "#64748b")
      .attr("stroke-width", 2)
      .attr("opacity", 0.7);

    // Nodes group
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

    // --- Drag ---
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
      nodeG.call(
        d3
          .drag<SVGGElement, any>()
          .on("start", function (event, d) {
            if (!event.active && simulation && simulation.alphaTarget) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", function (event, d) {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", function (event, d) {
            if (!event.active && simulation && simulation.alphaTarget) simulation.alphaTarget(0);
          })
      );
      nodeG.on("dblclick", function (_event, d) {
        d.fx = null;
        d.fy = null;
        if (simulation && simulation.alphaTarget) simulation.alphaTarget(0.3).restart();
      });
    }

    // Interactions
    nodeG
      .on("mouseenter", (_event, d) => setHoveredNodeId(d.id))
      .on("mouseleave", () => setHoveredNodeId(null))
      .on("contextmenu", function (event, d) {
        event.preventDefault();
        setContextNodeId(d.id);
      });

    nodeG.on("keydown", function (event, d) {
      if (
        layoutMode === "manual" &&
        event.key.startsWith("Arrow")
      ) {
        event.preventDefault();
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
      // context menu and selection
      if (event.key === "Enter" || event.key === " ") {
        // selection could go here
      }
      if (
        ((event.shiftKey && event.key === "F10") ||
          event.key === "ContextMenu" ||
          event.key === "Apps")
      ) {
        setContextNodeId(d.id);
      }
    });

    // Mount React node portals
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

    // Animate on force mode
    if (layoutMode === "force") {
      simulation.on("tick", () => {
        captureSimulationPositions(simNodes);
        link
          .attr("x1", (d: any) => (d.source as any).x!)
          .attr("y1", (d: any) => (d.source as any).y!)
          .attr("x2", (d: any) => (d.target as any).x!)
          .attr("y2", (d: any) => (d.target as any).y!);
        nodeG.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      });
    } else {
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
      captureSimulationPositions(simNodes);
    }

    // Cleanup
    return () => {
      simulation.stop && simulation.stop();
      svg.on(".zoom", null);
    };
  }, [
    simNodes,
    simEdges,
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
    simulation,
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
    >
      {/* Draw edges for static layouts (force is handled by D3, empty group here) */}
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
