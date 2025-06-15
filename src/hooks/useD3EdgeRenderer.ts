
import * as d3 from "d3";
import { useGraphStore } from "@/state/useGraphStore";

type UseD3EdgeRendererProps = {
  svgGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  simEdges: any[];
  simNodes: any[];
  selectedEdgeId: string | null;
  selectEdge: (id: string | null) => void;
  edgeAppearances: any;
  onEdgeContextMenu?: (edgeId: string, event: MouseEvent) => void;
  setHoveredEdgeId?: (id: string | null) => void;
  setEdgeMousePos?: (pos: { x: number; y: number } | null) => void;
};

/**
 * Draw edges (lines), with events for context menu, hover, etc.
 */
export function useD3EdgeRenderer({
  svgGroup,
  simEdges,
  simNodes,
  selectedEdgeId,
  selectEdge,
  edgeAppearances,
  onEdgeContextMenu,
  setHoveredEdgeId,
  setEdgeMousePos,
}: UseD3EdgeRendererProps) {
  // Clean previous edge layer before rendering
  svgGroup.selectAll("g.edges").remove();

  // Draw lines for each edge
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

  return link;
}
