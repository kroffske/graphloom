import React from "react";
import * as Papa from "papaparse";
import { useGraphStore } from "@/state/useGraphStore";
import { SAMPLE_TAB_CSVS } from "./SampleTabs";
import UploadCsvSection from "./UploadCsvSection";
import MainSettingsSection from "./MainSettingsSection";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const [tab, setTab] = React.useState<"upload" | "settings">("upload");

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

  // --- Layout: Tabbed panel for upload & settings ---
  return (
    <div className="w-full flex flex-col items-start gap-0">
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
        <TabsList className="w-full mb-0 bg-background gap-2 px-0 pt-0 border-none">
          <TabsTrigger value="upload" className="flex-1 text-base py-2">
            Upload & Examples
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 text-base py-2">
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="p-0 w-full">
          <div className="w-full flex flex-col md:flex-row gap-6">
            <UploadCsvSection onExample={handleFillExample} />
          </div>
        </TabsContent>
        <TabsContent value="settings" className="p-0 w-full">
          <div className="w-full flex justify-center">
            <MainSettingsSection onFillExample={handleFillExample} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UploadPanel;
