import React, { useEffect } from "react";
import { useGraphStore } from "@/state/useGraphStore";
import { SAMPLE_TAB_CSVS } from "./SampleTabs";
import UploadCsvSection from "./UploadCsvSection";
import GlobalSettingsSection from "./GlobalSettingsSection";

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

  // Parse edges
  const resultsEdges = Papa.parse(edgesCsv.trim(), { header: true, skipEmptyLines: true });
  const dataEdges = resultsEdges.data as any[];
  const edges = dataEdges.map((row, i) => ({
    id: `e${i + 1}`,
    source: String(row.source),
    target: String(row.target),
    type: row.edge_type ? String(row.edge_type) : "default",
  }));

  return { nodes, edges };
}

const UploadPanel = () => {
  const { setNodes, setEdges } = useGraphStore();

  // Always fill Example data on mount
  useEffect(() => {
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

  // --- Layout: Two-column on desktop, stacked on mobile ---
  return (
    <div className="w-full flex flex-col md:flex-row md:items-start gap-6">
      {/* ---- LEFT COLUMN: Upload and Examples ---- */}
      <UploadCsvSection onExample={handleFillExample} />
      {/* ---- RIGHT COLUMN: Global Settings ---- */}
      <GlobalSettingsSection onFillExample={handleFillExample} />
    </div>
  );
};

export default UploadPanel;
