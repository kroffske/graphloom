
import * as Papa from "papaparse";
import { GraphNode, GraphEdge } from "@/types/graph";

// Type for raw CSV row data
type CsvRow = Record<string, string | number | boolean | null | undefined>;

// Type for parsed node CSV row
interface NodeCsvRow extends CsvRow {
  node_id: string;
  node_type: string;
  label?: string;
}

// Type for parsed edge CSV row
interface EdgeCsvRow extends CsvRow {
  source: string;
  target: string;
  edge_type?: string;
  timestamp?: string;
}

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
  const resultsNodes = Papa.parse<NodeCsvRow>(nodesCsv.trim(), {
    header: true,
    skipEmptyLines: true,
  });
  const dataNodes = resultsNodes.data;
  const nodeIds = new Set<string>();
  const nodes = dataNodes
    .map((row) => {
      const nodeId = row.node_id;
      if (!nodeId || !row.node_type || nodeIds.has(nodeId)) return null;
      nodeIds.add(nodeId);
      const attributes: Record<string, string | number | boolean> = {};
      Object.entries(row).forEach(([k, v]) => {
        attributes[k] = castToSupportedType(v as string | number | boolean | null | undefined);
      });
      return {
        id: nodeId,
        type: String(row.node_type),
        label: row.label ? String(row.label) : nodeId,
        attributes,
      };
    })
    .filter(Boolean);

  const resultsEdges = Papa.parse<EdgeCsvRow>(edgesCsv.trim(), {
    header: true,
    skipEmptyLines: true,
  });
  const dataEdges = resultsEdges.data;
  const edges = dataEdges.map((row, i) => {
    const attributes: Record<string, string | number | boolean> = {};
    Object.entries(row).forEach(([k, v]) => {
      attributes[k] = castToSupportedType(v);
    });
    const timestamp = row.timestamp ? Date.parse(row.timestamp) : undefined;
    if (row.timestamp && isNaN(timestamp as number)) {
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

  return { nodes: nodes as GraphNode[], edges };
}
