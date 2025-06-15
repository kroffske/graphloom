import React from "react";
import * as Papa from "papaparse";
import { useGraphStore } from "@/state/useGraphStore";
import { SAMPLE_TAB_CSVS } from "./SampleTabs";
import UploadCsvSection from "./UploadCsvSection";
import MainSettingsSection from "./MainSettingsSection";
import { ScrollArea } from "./ui/scroll-area";

// --- Copy helpers from UploadCsvSection ---
function castToSupportedType(val: unknown): string | number | boolean {
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
const RESERVED_NODE_KEYS = ["node_id", "node_type", "label"];
const RESERVED_EDGE_KEYS = ["source", "target", "edge_type"];

// Helper: parseCsvData for use on mount
function parseCsvData(nodesCsv: string, edgesCsv: string) {
  // Parse nodes
  const resultsNodes = Papa.parse(nodesCsv.trim(), { header: true, skipEmptyLines: true });
  const dataNodes = resultsNodes.data as any[];
  const nodeIds = new Set<string>();
  const nodes = dataNodes
    .map((row, idx) => {
      const nodeId = row.node_id;
      if (!nodeId || !row.node_type || nodeIds.has(nodeId)) return null;
      nodeIds.add(nodeId);
      const attributes: Record<string, string | number | boolean> = {};
      Object.entries(row).forEach(([k, v]) => {
        if (!RESERVED_NODE_KEYS.includes(k)) {
          attributes[k] = castToSupportedType(v);
        }
      });
      return {
        id: nodeId,
        type: String(row.node_type),
        label: row.label ? String(row.label) : nodeId,
        attributes,
      };
    })
    .filter(Boolean);

  // Parse edges with attributes
  const resultsEdges = Papa.parse(edgesCsv.trim(), { header: true, skipEmptyLines: true });
  const dataEdges = resultsEdges.data as any[];
  const edges = dataEdges.map((row, i) => {
    const attributes: Record<string, string | number | boolean> = {};
    Object.entries(row).forEach(([k, v]) => {
      if (!RESERVED_EDGE_KEYS.includes(k)) {
        attributes[k] = castToSupportedType(v);
      }
    });
    return {
      id: `e${i + 1}`,
      source: String(row.source),
      target: String(row.target),
      type: row.edge_type ? String(row.edge_type) : "default",
      attributes: Object.keys(attributes).length ? attributes : undefined,
    };
  });

  return { nodes, edges };
}

const UploadPanel = () => {
  const { setNodes, setEdges } = useGraphStore();

  // Always fill Example data on mount
  React.useEffect(() => {
    const { nodes: defaultNodes, edges: defaultEdges } = parseCsvData(
      SAMPLE_TAB_CSVS.example.nodes,
      SAMPLE_TAB_CSVS.example.edges
    );
    setNodes(defaultNodes);
    setEdges(defaultEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler for filling example data
  const handleFillExample = () => {
    const { nodes, edges } = parseCsvData(SAMPLE_TAB_CSVS.example.nodes, SAMPLE_TAB_CSVS.example.edges);
    setNodes(nodes);
    setEdges(edges);
  };

  // --- Show Upload/Examples and Settings SIDE BY SIDE, responsive layout ---
  // Updated to allow main div to use full available size
  return (
    <div className="flex flex-col gap-8 md:gap-10 md:flex-row flex-1 items-stretch h-full">
      {/* Upload & Examples section */}
      <div className="flex-shrink-0 w-full md:w-[420px]">
        <ScrollArea className="h-[340px] md:h-[calc(80vh-60px)]">
          <UploadCsvSection onExample={handleFillExample} />
        </ScrollArea>
      </div>
      {/* Main Settings section */}
      <div className="flex-1">
        <ScrollArea className="h-[340px] md:h-[calc(80vh-60px)]">
          <MainSettingsSection onFillExample={handleFillExample} />
        </ScrollArea>
      </div>
    </div>
  );
};

export default UploadPanel;
