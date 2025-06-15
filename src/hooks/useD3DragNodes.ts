
import * as d3 from "d3";

type UseD3DragNodesProps = {
  nodeG: d3.Selection<SVGGElement, any, null, undefined>;
  link: d3.Selection<SVGLineElement, any, null, undefined>;
  layoutMode: "simulation" | "manual";
  manualPositions: Record<string, { x: number; y: number }>;
  setDragging: (val: any) => void;
  saveManualPosition: (id: string, pos: { x: number; y: number }) => void;
};

/**
 * Manual mode: Only the dragged node is moved (one at a time). The node position is set directly from cursor.
 * This is a strict "holding" approach: on drag, node moves to cursor; on end, position is saved.
 */
export function useD3DragNodes({
  nodeG,
  link,
  layoutMode,
  manualPositions,
  setDragging,
  saveManualPosition,
}: UseD3DragNodesProps) {
  if (layoutMode === "manual") {
    nodeG.call(
      d3
        .drag<SVGGElement, any>()
        .on("start", function (event, d) {
          // Start holding only this node
          setDragging({ id: d.id });
        })
        .on("drag", function (event, d) {
          // Move node directly to the mouse position
          const moved = { x: event.x, y: event.y };
          d3.select(this).attr("transform", `translate(${moved.x},${moved.y})`);
          // Move connected links for immediate feedback (optional, could be omitted for simplicity)
          link.each(function (l: any) {
            if (l.source.id === d.id) {
              d3.select(this).attr("x1", moved.x).attr("y1", moved.y);
            } else if (l.target.id === d.id) {
              d3.select(this).attr("x2", moved.x).attr("y2", moved.y);
            }
          });
        })
        .on("end", function (event, d) {
          // Only this node, strict: position is directly from event
          const finalPos = { x: event.x, y: event.y };
          setDragging(null);
          saveManualPosition(d.id, finalPos);
        })
    );
  }
}

