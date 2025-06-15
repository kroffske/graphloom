
import { useEffect } from "react";
import * as d3 from "d3";

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
      .scaleExtent([0.25, 1.75])
      .on("zoom", (event) => {
        svgGroup.attr("transform", event.transform);
      });
    svg.call(zoom as any);
    return () => {
      svg.on(".zoom", null);
    };
  }, [svgRef, svgGroup]);
}
