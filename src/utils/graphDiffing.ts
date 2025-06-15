
import type { GraphNode, GraphEdge } from "@/types/graph";

/** Returns all nodes that have changed x/y/attrs or are new/deleted (by id). */
export function diffGraphNodes(oldNodes: GraphNode[], newNodes: GraphNode[]): GraphNode[] {
  const oldMap = Object.fromEntries(oldNodes.map(n => [n.id, n]));
  const changed: GraphNode[] = [];
  for (const node of newNodes) {
    const old = oldMap[node.id];
    if (!old ||
      old.x !== node.x ||
      old.y !== node.y ||
      JSON.stringify(old.attributes) !== JSON.stringify(node.attributes) ||
      old.type !== node.type ||
      old.label !== node.label
    ) {
      changed.push(node);
    }
  }
  return changed;
}

export function diffGraphEdges(oldEdges: GraphEdge[], newEdges: GraphEdge[]): GraphEdge[] {
  const oldMap = Object.fromEntries(oldEdges.map(e => [e.id, e]));
  const changed: GraphEdge[] = [];
  for (const edge of newEdges) {
    const old = oldMap[edge.id];
    if (!old ||
      old.source !== edge.source ||
      old.target !== edge.target ||
      old.type !== edge.type
    ) {
      changed.push(edge);
    }
  }
  return changed;
}
