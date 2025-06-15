
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useD3DragNodes } from "@/hooks/useD3DragNodes";
import { useD3ZoomAndPan } from "@/hooks/useD3ZoomAndPan";
import GraphD3NodeMount from "@/components/GraphD3NodeMount";
import { useGraphStore, GraphStore } from "@/state/useGraphStore";
import { resolveLabelTemplate } from "@/utils/labelTemplate";

// Break out the shape constants since they may be used outside the hook as well
export const WIDTH = 900;
export const HEIGHT = 530;
export const NODE_RADIUS = 36;

type UseD3SvgGraphProps = {
  svgRef: React.RefObject<SVGSVGElement>;
  svgGroupRef: React.MutableRefObject<SVGGElement | null>;
  nodes: any[];
  edges: any[];
  layoutMode: "force" | "circle" | "hierarchy" | "manual";
  manualPositions: Record<string, { x: number; y: number }>;
  setManualPositions: (v: any) => void;
  saveManualPosition: (id: string, pos: { x: number; y: number }) => void;
  hiddenNodeIds: Set<string>;
  setHiddenNodeIds: (s: Set<string>) => void;
  setHoveredNodeId: (id: string | null) => void;
  setHoveredEdgeId: (id: string | null) => void;
  setContextNodeId: (id: string | null) => void;
  dragging: any;
  setDragging: (d: any) => void;
  captureSimulationPositions: (simNodes: any[]) => void;
  initialPositions?: Record<string, { x: number; y: number }>;
  /**
   * Optional: show context menu for edge (edgeId, event)
   * You can plug in a UI or logic to display/hide a menu.
   */
  onEdgeContextMenu?: (edgeId: string, event: MouseEvent) => void;
  simulation?: any;
  simNodes: any[];
  simEdges: any[];
};

function getEdgeLabel(
  d: any,
  showEdgeLabels: boolean,
  edgeTypeAppearances: any,
  edgeAppearances: any,
  nodes: any[]
): string {
  if (!showEdgeLabels) return "";
  const typeApp = edgeTypeAppearances[d.type || "default"] || {};
  const edgeApp = { ...typeApp, ...(d.appearance || {}), ...(edgeAppearances[d.id] || {}) };
  const fallbackId = "";
  let label = edgeApp.label;

  if (label === undefined) {
    if (edgeApp.labelTemplate) {
      const sourceNode = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source);
      const targetNode = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target);
      const context = {
        ...d,
        ...d.attributes,
        source_label: sourceNode?.label,
        target_label: targetNode?.label,
        source: sourceNode,
        target: targetNode,
      };
      label = resolveLabelTemplate(edgeApp.labelTemplate, context, fallbackId);
    }
  }
  return label || "";
}

export function useD3SvgGraph({
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
  setHoveredEdgeId,
  setContextNodeId,
  dragging,
  setDragging,
  captureSimulationPositions,
  initialPositions,
  simulation,
  simNodes,
  simEdges,
  onEdgeContextMenu,
}: UseD3SvgGraphProps) {
  // Get edge selection API
  const { selectedEdgeId, selectEdge, edgeAppearances, showEdgeLabels, edgeTypeAppearances } = useGraphStore(
    (state: GraphStore) => ({
      selectedEdgeId: state.selectedEdgeId,
      selectEdge: state.selectEdge,
      edgeAppearances: state.edgeAppearances,
      showEdgeLabels: state.showEdgeLabels,
      edgeTypeAppearances: state.edgeTypeAppearances,
    })
  );

  useD3ZoomAndPan({
    svgRef,
    svgGroup: svgGroupRef.current ? d3.select(svgGroupRef.current) : null,
  });

  // ------ D3 Setup/Rendering: Runs only on simNodes/simEdges/layout/topology updates ------
  useEffect(() => {
    if (!svgRef.current || !simNodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const svgGroup = svg.append("g");
    svgGroupRef.current = svgGroup.node() as SVGGElement;

    // -- EDGE LAYER --
    const linkG = svgGroup.append("g").attr("class", "edges").selectAll("g")
      .data(simEdges)
      .join("g");

    const link = linkG.append("line")
      .attr("stroke", (d: any) => {
        // Use appearance or fallback
        const typeApp = edgeTypeAppearances[d.type || 'default'] || {};
        const appearance = { ...typeApp, ...(d.appearance || {}), ...(edgeAppearances[d.id] || {}) };
        return appearance.color || "#64748b";
      })
      .attr("stroke-width", (d: any) => {
        const typeApp = edgeTypeAppearances[d.type || 'default'] || {};
        const appearance = { ...typeApp, ...(d.appearance || {}), ...(edgeAppearances[d.id] || {}) };
        return appearance.width || 2;
      })
      .attr("opacity", (d: any) => (selectedEdgeId === d.id ? 1 : 0.7))
      .attr("cursor", "pointer")
      .attr("tabindex", 0)
      .attr("id", (d: any) => "edge-" + d.id)
      // Prevent drag/select weirdness on mousedown/up
      .on("mousedown", function(event: any) { event.stopPropagation(); })
      .on("mouseup", function(event: any) { event.stopPropagation(); })
      // DO NOT attach click/selection/keydown handlers for left click or keyboard
      .on("click", null)
      .on("keydown", null)
      .on("mouseenter", function (_event, d: any) {
        setHoveredEdgeId(d.id);
      })
      .on("mouseleave", function () {
        setHoveredEdgeId(null);
      })
      // Show context menu on right-click
      .on("contextmenu", function(event: MouseEvent, d: any) {
        event.preventDefault();
        event.stopPropagation();
        // --- UPDATE: Select edge on right-click before showing context menu ---
        if (typeof selectEdge === "function") {
          selectEdge(d.id);
        }
        // If a callback is provided, call it; otherwise fallback to setContextNodeId for now
        if (onEdgeContextMenu) {
          onEdgeContextMenu(d.id, event);
        } else if (typeof setContextNodeId === "function") {
          setContextNodeId(d.id);
        }
      });
    
    const linkLabel = linkG.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", 13)
      .attr("fill", "#475569")
      .style("user-select", "none")
      .style("pointer-events", "none")
      .style("text-shadow", "0 0 3px #fff, 0 0 8px #fff")
      .style("font-weight", 500)
      .style("paint-order", "stroke fill")
      .attr("stroke", "#fff")
      .attr("stroke-width", 4)
      .attr("stroke-linejoin", "round")
      .append("tspan")
      .attr("fill", "#334155")
      .attr("stroke", "white")
      .attr("stroke-width", "1.5")
      .style("paint-order", "stroke fill")
      .text((d: any) => getEdgeLabel(d, showEdgeLabels, edgeTypeAppearances, edgeAppearances, simNodes));

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
      .html((d: any) => `<div id="d3-node-${d.id}"></div>`);

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
          .on("start", function (event, d: any) {
            if (!event.active && simulation && simulation.alphaTarget)
              simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", function (event, d: any) {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", function (event, d: any) {
            if (!event.active && simulation && simulation.alphaTarget)
              simulation.alphaTarget(0);
          })
      );
      nodeG.on("dblclick", function (_event, d: any) {
        d.fx = null;
        d.fy = null;
        if (simulation && simulation.alphaTarget)
          simulation.alphaTarget(0.3).restart();
      });
    }

    nodeG
      .on("mouseenter", (_event, d: any) => setHoveredNodeId(d.id))
      .on("mouseleave", () => setHoveredNodeId(null))
      .on("contextmenu", function (event, d: any) {
        event.preventDefault();
        setContextNodeId(d.id);
      });

    nodeG.on("keydown", function (event, d: any) {
      if (layoutMode === "manual" && event.key.startsWith("Arrow")) {
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
      if (event.key === "Enter" || event.key === " ") {
      }
      if (
        ((event.shiftKey && event.key === "F10") ||
          event.key === "ContextMenu" ||
          event.key === "Apps")
      ) {
        setContextNodeId(d.id);
      }
    });

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

    if (layoutMode === "force") {
      simulation.on("tick", () => {
        captureSimulationPositions(simNodes);
        link
          .attr("x1", (d: any) => (d.source as any).x!)
          .attr("y1", (d: any) => (d.source as any).y!)
          .attr("x2", (d: any) => (d.target as any).x!)
          .attr("y2", (d: any) => (d.target as any).y!);
        
        linkLabel
          .attr("x", (d: any) => ((d.source as any).x! + (d.target as any).x!) / 2)
          .attr("y", (d: any) => ((d.source as any).y! + (d.target as any).y!) / 2);

        nodeG.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        // // Optionally: visually indicate selection on D3 links after each tick
        link
          .attr("opacity", (d: any) => (selectedEdgeId === d.id ? 1 : 0.7))
          .attr("stroke-width", (d: any) => {
            const typeApp = edgeTypeAppearances[d.type || 'default'] || {};
            const appearance = { ...typeApp, ...(d.appearance || {}), ...(edgeAppearances[d.id] || {}) };
            const width = appearance.width || 2;
            return selectedEdgeId === d.id ? width + 2 : width;
          })
          .attr("filter", (d: any) =>
            selectedEdgeId === d.id ? "drop-shadow(0 0 4px #60a5fa)" : null
          );
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
        
      linkLabel
        .attr("x", (d: any) => {
          const s: any = typeof d.source === "object" ? d.source : simNodes.find((n: any) => n.id === d.source);
          const t: any = typeof d.target === "object" ? d.target : simNodes.find((n: any) => n.id === d.target);
          if (!s || !t) return 0;
          return (s.x + t.x) / 2;
        })
        .attr("y", (d: any) => {
          const s: any = typeof d.source === "object" ? d.source : simNodes.find((n: any) => n.id === d.source);
          const t: any = typeof d.target === "object" ? d.target : simNodes.find((n: any) => n.id === d.target);
          if (!s || !t) return 0;
          return (s.y + t.y) / 2;
        });

      nodeG.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      captureSimulationPositions(simNodes);
      // For static layouts, visually indicate selection state as well
      link
        .attr("opacity", (d: any) => (selectedEdgeId === d.id ? 1 : 0.7))
        .attr("stroke-width", (d: any) => {
            const typeApp = edgeTypeAppearances[d.type || 'default'] || {};
            const appearance = { ...typeApp, ...(d.appearance || {}), ...(edgeAppearances[d.id] || {}) };
            const width = appearance.width || 2;
            return selectedEdgeId === d.id ? width + 2 : width;
        })
        .attr("filter", (d: any) =>
          selectedEdgeId === d.id ? "drop-shadow(0 0 4px #60a5fa)" : null
        );
    }

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
    setHoveredEdgeId,
    setContextNodeId,
    dragging,
    captureSimulationPositions,
    simulation,
    initialPositions,
  ]);

  // ----- NEW: Selection and appearance highlighting only (does not change graph structure) -----
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const links = svg.selectAll("g.edges line");
    links
      .attr("opacity", (d: any) => (selectedEdgeId === d.id ? 1 : 0.7))
      .attr("stroke-width", (d: any) => {
        const typeApp = edgeTypeAppearances[d.type || 'default'] || {};
        const appearance = { ...typeApp, ...(d.appearance || {}), ...(edgeAppearances[d.id] || {}) };
        const width = appearance.width || 2;
        return selectedEdgeId === d.id ? width + 2 : width;
      })
      .attr("filter", (d: any) =>
        selectedEdgeId === d.id ? "drop-shadow(0 0 4px #60a5fa)" : null
      )
      .attr("stroke", (d: any) => {
        const typeApp = edgeTypeAppearances[d.type || 'default'] || {};
        const appearance = { ...typeApp, ...(d.appearance || {}), ...(edgeAppearances[d.id] || {}) };
        return appearance.color || "#64748b";
      });

    const linkLabels = svg.selectAll("g.edges text tspan");
    linkLabels.text((d: any) => getEdgeLabel(d, showEdgeLabels, edgeTypeAppearances, edgeAppearances, simNodes));

  }, [svgRef, selectedEdgeId, edgeAppearances, edgeTypeAppearances, showEdgeLabels, simNodes]);
}
