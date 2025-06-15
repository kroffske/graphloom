
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

/**
 * This hook attaches D3 drag behavior that is robust for manual mode—positions are always relative
 * to the rendered node location in manualPositions, falling back to node x/y.
 */
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
          // Use current coordinate in manualPositions if available, else d.x/d.y
          const currPos = manualPositions[d.id] ?? { x: d.x ?? 0, y: d.y ?? 0 };
          setDragging({
            id: d.id,
            // event.x and event.y are pointer location in SVG space,
            // subtract node position to get offset.
            offsetX: event.x - currPos.x,
            offsetY: event.y - currPos.y,
          });
        })
        .on("drag", function (event, d) {
          // During drag, always use offset from event plus original node position.
          const drag = d3.select(this);
          // Use drag offset from 'start'
          // event.subject is d; d.id is available
          // Fetch offsetX/offsetY from d3 selection custom property or fallback if not found
          let offsetX = 0, offsetY = 0;
          // event is a DragEvent; get "offsetX/Y" from current dragging prop, if set
          // We can't access setDragging here, so must get from event.subject or fallback
          // Instead, just compute as in 'start'
          const currPos = manualPositions[d.id] ?? { x: d.x ?? 0, y: d.y ?? 0 };
          offsetX = (drag as any)._dragOffsetX ??
            (event.subject && event.subject._dragOffsetX) ??
            (event.x - currPos.x);
          offsetY = (drag as any)._dragOffsetY ??
            (event.subject && event.subject._dragOffsetY) ??
            (event.y - currPos.y);

          // Save on the element for consistency between drag events
          (drag as any)._dragOffsetX = offsetX;
          (drag as any)._dragOffsetY = offsetY;
          const moved = {
            x: event.x - offsetX,
            y: event.y - offsetY,
          };

          drag.attr("transform", `translate(${moved.x},${moved.y})`);
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
          // Use drag offset from ._dragOffsetX/Y (ensure that the saved position matches drag)
          const drag = d3.select(this);
          const offsetX = (drag as any)._dragOffsetX ?? 0;
          const offsetY = (drag as any)._dragOffsetY ?? 0;
          const moved = {
            x: event.x - offsetX,
            y: event.y - offsetY,
          };
          setDragging(null);
          saveManualPosition(d.id, moved);
        })
    );
  }
}

