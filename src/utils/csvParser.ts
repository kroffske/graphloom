
import * as Papa from "papaparse";
import { GraphNode, GraphEdge } from "@/types/graph";

export function castToSupportedType(val: unknown): string | number | boolean {
  if (typeof val === "string") {
    const num = Number(val);
    if (!isNaN(num) && val.trim() !== "") return num;
    if (val.toLowerCase() === "true") return true;
    if (val.toLowerCase() === "false") return false;
    return val;
  }
  if (typeof val === "number" || typeof val === "boolean") return val;
  return String(val);
}

export function parseCsvData(
  nodesCsv: string,
  edgesCsv: string
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const resultsNodes = Papa.parse(nodesCsv.trim(), {
    header: true,
    skipEmptyLines: true,
  });
  const dataNodes = resultsNodes.data as any[];
  const nodeIds = new Set<string>();
  const nodes = dataNodes
    .map((row) => {
      const nodeId = row.node_id;
      if (!nodeId || !row.node_type || nodeIds.has(nodeId)) return null;
      nodeIds.add(nodeId);
      const attributes: Record<string, string | number | boolean> = {};
      Object.entries(row).forEach(([k, v]) => {
        attributes[k] = castToSupportedType(v);
      });
      return {
        id: nodeId,
        type: String(row.node_type),
        label: row.label ? String(row.label) : nodeId,
        attributes,
      };
    })
    .filter(Boolean);

  const resultsEdges = Papa.parse(edgesCsv.trim(), {
    header: true,
    skipEmptyLines: true,
  });
  const dataEdges = resultsEdges.data as any[];
  const edges = dataEdges.map((row, i) => {
    const attributes: Record<string, string | number | boolean> = {};
    Object.entries(row).forEach(([k, v]) => {
      attributes[k] = castToSupportedType(v);
    });
    const timestamp = row.timestamp ? Date.parse(row.timestamp) : undefined;
    if (row.timestamp && isNaN(timestamp)) {
        console.warn(`Invalid timestamp in edges.csv row ${i + 2}: "${row.timestamp}"`);
    }

    return {
      id: `e${i + 1}`,
      source: String(row.source),
      target: String(row.target),
      type: row.edge_type ? String(row.edge_type) : "default",
      attributes: Object.keys(attributes).length ? attributes : undefined,
      timestamp: timestamp && !isNaN(timestamp) ? timestamp : undefined,
    };
  });

  return { nodes: nodes as GraphNode[], edges: edges as GraphEdge[] };
}
