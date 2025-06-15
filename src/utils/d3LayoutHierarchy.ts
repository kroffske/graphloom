import * as d3 from "d3";

export function d3LayoutHierarchy(nodes: any[], edges: any[], WIDTH: number, HEIGHT: number) {
  // Build tree structure (assume the first node is root if not specified)
  if (nodes.length === 0) {
    return {
      simulation: { on: () => {}, stop: () => {} },
      simNodes: [],
      simEdges: [],
    };
  }
  // Build a map for quick access
  const nodeMap = new Map(nodes.map((n) => [n.id, { ...n, children: [] }]));
  // Build child relations (works as long as the graph is mostly tree-like)
  edges.forEach((e) => {
    const parent = nodeMap.get(e.source);
    const child = nodeMap.get(e.target);
    if (parent && child) {
      parent.children.push(child);
    }
  });
  // Find root node (no incoming edges)
  const childIds = new Set(edges.map((e) => e.target));
  const root = nodes.find((n) => !childIds.has(n.id)) || nodes[0];

  // Use d3-hierarchy to lay out the tree
  const d3Hierarchy = d3.hierarchy(nodeMap.get(root.id));
  const treeLayout = d3.tree().size([WIDTH, HEIGHT - 60]);
  treeLayout(d3Hierarchy);

  // Align coordinates and flatten nodes
  const simNodes = [];
  d3Hierarchy.each((d) => {
    if (d.data) {
      d.data.x = d.x;
      d.data.y = d.y + 40; // vertical margin
      simNodes.push(d.data);
    }
  });

  // Edges remain unchanged, but x/y now filled on nodes
  const simEdges = edges.map(e => ({ ...e }));

  return {
    simulation: { on: () => {}, stop: () => {} },
    simNodes,
    simEdges,
  };
}
