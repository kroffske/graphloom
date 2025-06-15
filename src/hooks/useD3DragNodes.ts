
import { useCallback } from "react";
import * as d3 from "d3";

type UseD3DragNodesProps = {
  nodeG: d3.Selection<SVGGElement, any, null, undefined>;
  link: d3.Selection<SVGLineElement, any, null, undefined>;
  layoutMode: "simulation" | "manual";
  manualPositions: Record<string, { x: number; y: number }>;
  setDragging: (val: any) => void;
  saveManualPosition: (id: string, pos: { x: number; y: number }) => void;
};

export function useD3DragNodes({
  nodeG,
  link,
  layoutMode,
  manualPositions,
  setDragging,
  saveManualPosition,
}: UseD3DragNodesProps) {
  // Enable drag only in manual mode.
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
}
