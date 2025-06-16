
import { useEffect } from "react";
import * as d3 from "d3";
import { graphEventBus } from "@/lib/graphEventBus";

type UseD3ZoomAndPanProps = {
  svgRef: React.RefObject<SVGSVGElement>;
  svgGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null;
};
export function useD3ZoomAndPan({ svgRef, svgGroup }: UseD3ZoomAndPanProps) {
  useEffect(() => {
    if (!svgRef.current || !svgGroup) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 1.75]) // more zoomed-out: allow as far as 0.05x
      .on("zoom", (event) => {
        svgGroup.attr("transform", event.transform);
        // Emit transform for portal rendering
        graphEventBus.emit('transform:change', {
          k: event.transform.k,
          x: event.transform.x,
          y: event.transform.y,
        });
      });
    svg.call(zoom as any);
    return () => {
      svg.on(".zoom", null);
    };
  }, [svgRef, svgGroup]);
}
