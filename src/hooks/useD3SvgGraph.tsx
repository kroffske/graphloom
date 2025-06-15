import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useD3DragNodes } from "@/hooks/useD3DragNodes";
import { useD3ZoomAndPan } from "@/hooks/useD3ZoomAndPan";
import GraphD3NodeMount from "@/components/GraphD3NodeMount";
import { useGraphStore } from "@/state/useGraphStore";

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
  setContextNodeId: (id: string | null) => void;
  dragging: any;
  setDragging: (d: any) => void;
  captureSimulationPositions: (simNodes: any[]) => void;
  initialPositions?: Record<string, { x: number; y: number }>;
  simulation: any;
  simNodes: any[];
  simEdges: any[];
  /**
   * Optional: show context menu for edge (edgeId, event)
   * You can plug in a UI or logic to display/hide a menu.
   */
  onEdgeContextMenu?: (edgeId: string, event: MouseEvent) => void;
  // NEW for hover
  setHoveredEdgeId?: (id: string | null) => void;
  setEdgeMousePos?: (pos: { x: number; y: number } | null) => void;
};

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
  setContextNodeId,
  dragging,
  setDragging,
  captureSimulationPositions,
  initialPositions,
  simulation,
  simNodes,
  simEdges,
  onEdgeContextMenu,
  // NEW for hover
  setHoveredEdgeId,
  setEdgeMousePos,
}: UseD3SvgGraphProps) {
  // Get edge selection API
  const { selectedEdgeId, selectEdge, edgeAppearances, showEdgeLabels } = useGraphStore();

  useD3ZoomAndPan({
    svgRef,
    svgGroup: svgGroupRef.current ? d3.select(svgGroupRef.current) : null,
  });

  useEffect(() => {
    if (!svgRef.current || !simNodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const svgGroup = svg.append("g");
    svgGroupRef.current = svgGroup.node() as SVGGElement;

    // -- EDGE LAYER --
    const link = svgGroup.append("g").attr("class", "edges").selectAll("line")
      .data(simEdges)
      .enter()
      .append("line")
      .attr("stroke", (d: any) => {
        const id = d.id;
        const appearance = { ...(d.appearance || {}), ...(edgeAppearances[id] || {}) };
        return appearance.color || "#64748b";
      })
      .attr("stroke-width", (d: any) => {
        const id = d.id;
        const appearance = { ...(d.appearance || {}), ...(edgeAppearances[id] || {}) };
        return appearance.width || 2;
      })
      .attr("opacity", (d: any) => (selectedEdgeId === d.id ? 1 : 0.7))
      .attr("cursor", "context-menu")
      .attr("tabindex", 0)
      .attr("id", (d: any) => "edge-" + d.id)
      .on("mousedown", function(event: any) { event.stopPropagation(); })
      .on("mouseup", function(event: any) { event.stopPropagation(); })
      .on("click", null)
      .on("keydown", null)
      .on("contextmenu", function(event: MouseEvent, d: any) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof selectEdge === "function") {
          selectEdge(d.id);
        }
        if (onEdgeContextMenu) {
          onEdgeContextMenu(d.id, event);
        } else if (typeof setContextNodeId === "function") {
          setContextNodeId(d.id);
        }
      })
      .on("mouseenter", function(event: MouseEvent, d: any) {
        if (setHoveredEdgeId) setHoveredEdgeId(d.id);
        if (setEdgeMousePos) setEdgeMousePos({ x: event.clientX, y: event.clientY });
      })
      .on("mousemove", function(event: MouseEvent, d: any) {
        if (setEdgeMousePos) setEdgeMousePos({ x: event.clientX, y: event.clientY });
      })
      .on("mouseleave", function() {
        if (setHoveredEdgeId) setHoveredEdgeId(null);
        if (setEdgeMousePos) setEdgeMousePos(null);
      });

    if (layoutMode === "force") {
      simulation.on("tick", () => {
        captureSimulationPositions(simNodes);
        link
          .attr("x1", (d: any) => (d.source as any).x!)
          .attr("y1", (d: any) => (d.source as any).y!)
          .attr("x2", (d: any) => (d.target as any).x!)
          .attr("y2", (d: any) => (d.target as any).y!);
        link
          .attr("opacity", (d: any) => (selectedEdgeId === d.id ? 1 : 0.7))
          .attr("stroke-width", (d: any) => {
            const id = d.id;
            const appearance = { ...(d.appearance || {}), ...(edgeAppearances[id] || {}) };
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
      captureSimulationPositions(simNodes);
      link
        .attr("opacity", (d: any) => (selectedEdgeId === d.id ? 1 : 0.7))
        .attr("stroke-width", (d: any) => {
          const id = d.id;
          const appearance = { ...(d.appearance || {}), ...(edgeAppearances[id] || {}) };
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
    setContextNodeId,
    dragging,
    captureSimulationPositions,
    simulation,
    initialPositions,
    selectEdge,
    selectedEdgeId,
    edgeAppearances,
    onEdgeContextMenu
  ]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const links = svg.selectAll("g.edges line");
    links
      .attr("opacity", (d: any) => (selectedEdgeId === d.id ? 1 : 0.7))
      .attr("stroke-width", (d: any) => {
        const id = d.id;
        const appearance = { ...(d.appearance || {}), ...(edgeAppearances[id] || {}) };
        const width = appearance.width || 2;
        return selectedEdgeId === d.id ? width + 2 : width;
      })
      .attr("filter", (d: any) =>
        selectedEdgeId === d.id ? "drop-shadow(0 0 4px #60a5fa)" : null
      )
      .attr("stroke", (d: any) => {
        const id = d.id;
        const appearance = { ...(d.appearance || {}), ...(edgeAppearances[id] || {}) };
        return appearance.color || "#64748b";
      });
  }, [svgRef, selectedEdgeId, edgeAppearances]);
}
