
import * as d3 from "d3";

export function d3LayoutCircle(nodes: any[], edges: any[], WIDTH: number, HEIGHT: number) {
  const simNodes = nodes.map((n) => ({ ...n }));
  const simEdges = edges.map((e) => ({ ...e }));

  // Arrange nodes in a circle (polar coordinates)
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  const r = Math.min(cx, cy) * 0.7;
  const k = 2 * Math.PI / Math.max(simNodes.length, 1);
  simNodes.forEach((n, i) => {
    n.x = cx + r * Math.cos(i * k - Math.PI / 2);
    n.y = cy + r * Math.sin(i * k - Math.PI / 2);
  });

  // Return API similar to force simulation for updates
  return {
    simulation: {
      on: () => {},
      stop: () => {},
    },
    simNodes,
    simEdges,
  };
}
