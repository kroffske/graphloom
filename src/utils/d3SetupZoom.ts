
import * as d3 from "d3";

/**
 * Sets up D3 zoom and pan on the given svg and group.
 * Returns a cleanup callback to remove listeners.
 */
export function d3SetupZoom(
  svgElement: SVGSVGElement | null,
  svgGroup: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  if (!svgElement) return () => {};
  const svg = d3.select(svgElement);
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
}
