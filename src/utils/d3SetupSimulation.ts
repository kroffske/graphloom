
import * as d3 from "d3";

export function d3SetupSimulation(
  nodes: any[],
  edges: any[],
  layoutMode: "simulation" | "manual",
  NODE_RADIUS: number,
  WIDTH: number,
  HEIGHT: number
) {
  const simNodes = nodes.map((n) => ({ ...n }));
  const simEdges = edges.map((e) => ({ ...e }));

  const simulation = d3
    .forceSimulation(simNodes)
    .force(
      "link",
      d3
        .forceLink(simEdges)
        .id((d: any) => d.id)
        .distance(120)
        .strength(0.6)
    )
    .force("charge", d3.forceManyBody().strength(-370))
    .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))
    .force("collision", d3.forceCollide(NODE_RADIUS + 12));

  if (layoutMode === "manual") {
    simulation.alpha(0).alphaTarget(0).stop();
  }
  return { simulation, simNodes, simEdges };
}
