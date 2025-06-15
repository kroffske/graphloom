
import * as d3 from "d3";
import { NODE_RADIUS } from "./useD3SvgGraph";

type UseD3NodeRendererProps = {
  svgGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  simNodes: any[];
  hiddenNodeIds: Set<string>;
  dragging: any;
  setHoveredNodeId?: (id: string | null) => void;
  setContextNodeId?: (id: string | null) => void;
};

/**
 * Render SVG nodes (circles + foreignObjects for React content)
 */
export function useD3NodeRenderer({
  svgGroup,
  simNodes,
  hiddenNodeIds,
  dragging,
  setHoveredNodeId,
  setContextNodeId,
}: UseD3NodeRendererProps) {
  // Clean previous node layer before rendering
  svgGroup.selectAll("g.nodes").remove();

  const nodeGroup = svgGroup.append("g").attr("class", "nodes");

  // 1. Draw SVG circles for each node
  nodeGroup
    .selectAll("circle")
    .data(simNodes)
    .enter()
    .append("circle")
    .attr("cx", (d: any) => d.x)
    .attr("cy", (d: any) => d.y)
    .attr("r", NODE_RADIUS)
    // Use a transparent fill so React node content is visible under circle
    .attr("fill", (d: any) => d.appearance?.backgroundColor || "rgba(255,255,255,0.70)")
    .attr("stroke", (d: any) => d.appearance?.lineColor || "#888")
    .attr("stroke-width", (d: any) => d.id === (dragging?.id) ? 3 : 1.5)
    .attr("opacity", (d: any) => hiddenNodeIds.has(d.id) ? 0.15 : 1)
    .attr("pointer-events", "visiblePainted");

  // 2. Create a foreignObject for mounting React node content (icon, etc)
  nodeGroup
    .selectAll("foreignObject")
    .data(simNodes)
    .enter()
    .append("foreignObject")
    .attr("x", (d: any) => d.x - NODE_RADIUS)
    .attr("y", (d: any) => d.y - NODE_RADIUS)
    .attr("width", NODE_RADIUS * 2)
    .attr("height", NODE_RADIUS * 2)
    // Only the child should be interactive!
    .attr("pointer-events", "none")
    .attr("style", "overflow: visible; z-index: 2;")
    .each(function (d: any) {
      // Our React portal will mount here
      let $div = d3.select(this)
        .append("xhtml:div")
        .attr("id", `d3-node-${d.id}`)
        .style("width", `${NODE_RADIUS * 2}px`)
        .style("height", `${NODE_RADIUS * 2}px`)
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center")
        .style("pointer-events", "auto")
        .style("position", "relative")
        .style("z-index", "2");
      // For debug: let us make sure the div is being rendered
      if (typeof window !== "undefined") {
        // Use setTimeout so logs only once for visible nodes
        setTimeout(() => {
          const el = document.getElementById(`d3-node-${d.id}`);
          // eslint-disable-next-line no-console
          console.log(`Mounted React node portal: d3-node-${d.id}`, !!el);
        }, 0);
      }
    });

  // 3. Node event handlers (hover & context menu)
  nodeGroup.selectAll("circle")
    .on("mouseenter", function (event: MouseEvent, d: any) {
      setHoveredNodeId?.(d.id);
    })
    .on("mouseleave", function () {
      setHoveredNodeId?.(null);
    })
    .on("contextmenu", function (event: MouseEvent, d: any) {
      event.preventDefault();
      event.stopPropagation();
      setContextNodeId?.(d.id);
    });

  // Return nodeGroup ref for further updates (e.g., simulation ticks)
  return nodeGroup;
}

