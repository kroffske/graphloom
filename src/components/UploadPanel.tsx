import React, { useCallback, useRef, useEffect } from "react";
import * as Papa from "papaparse";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AppearancePresetsSection from "@/components/AppearancePresetsSection";
import { useGraphStore } from "@/state/useGraphStore";
import { SampleTabs, SAMPLE_TAB_CSVS } from "./SampleTabs";
import { Settings, Import } from "lucide-react";

// Helper: Only allow string | number | boolean
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

// CSV PARSING UTILS FOR DEFAULT DATA
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const { setNodes, setEdges, nodes, edges, manualPositions } = useGraphStore();

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

  // Parse CSV and validate
  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    let nodeFile: File | null = null;
    let edgeFile: File | null = null;
    for (let i = 0; i < files.length; i++) {
      if (files[i].name.match(/^nodes\.csv$/i)) nodeFile = files[i];
      if (files[i].name.match(/^edges\.csv$/i)) edgeFile = files[i];
    }
    if (!nodeFile || !edgeFile) {
      toast.error("Please upload both nodes.csv and edges.csv files.");
      return;
    }

    Papa.parse(nodeFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        const data = results.data as any[];
        if (!data.length) {
          toast.error("nodes.csv has no data rows.");
          return;
        }
        const row0 = data[0];
        if (!row0?.node_id || !row0?.node_type) {
          toast.error("Invalid nodes.csv: must have node_id and node_type columns.");
          return;
        }
        const ids = new Set<string>();
        let hasInvalidRow = false;

        const nodes = data.map((row, idx) => {
          const nodeId = String(row.node_id);
          if (!nodeId || !row.node_type) {
            hasInvalidRow = true;
            return null;
          }
          if (ids.has(nodeId)) {
            toast.error(`Duplicate node_id in row ${idx + 2}: "${nodeId}"`);
            hasInvalidRow = true;
          }
          ids.add(nodeId);
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
        }).filter(Boolean);

        if (hasInvalidRow) {
          toast.error("One or more invalid node rows were found and skipped.");
        }

        setNodes(nodes as any);
        toast.success("Loaded nodes.csv!");
      },
      error: () => toast.error("Failed to parse nodes.csv"),
    });

    Papa.parse(edgeFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        const data = results.data as any[];
        if (!data.length) {
          toast.error("edges.csv has no data rows.");
          return;
        }
        const row0 = data[0];
        if (!row0?.source || !row0?.target) {
          toast.error("Invalid edges.csv: must have source and target columns.");
          return;
        }
        const edges = data.map((row, i) => {
          return {
            id: `e${i + 1}`,
            source: String(row.source),
            target: String(row.target),
            type: row.edge_type ? String(row.edge_type) : "default",
          };
        });
        setEdges(edges);
        toast.success("Loaded edges.csv!");
      },
      error: () => toast.error("Failed to parse edges.csv"),
    });
  }, [setNodes, setEdges]);

  const onFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  }, [processFiles]);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  // Function to fill Example data (sample-related code removed)
  const fillExample = () => {
    const { nodes, edges } = parseCsvData(SAMPLE_TAB_CSVS.example.nodes, SAMPLE_TAB_CSVS.example.edges);
    setNodes(nodes);
    setEdges(edges);
    toast.success("Loaded example data!");
  };

  // Export current graph state as JSON
  function handleExport() {
    const payload = {
      nodes,
      edges,
      manualPositions,
      timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const tempLink = document.createElement("a");
    tempLink.href = url;
    tempLink.download = "graph-export.json";
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    URL.revokeObjectURL(url);
    toast.success("Exported graph data as JSON.");
  }

  // Import graph state from JSON
  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(String(evt.target?.result));
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
          toast.success("Imported graph data!");
        } else {
          toast.error("Invalid file format: Missing nodes or edges.");
        }
      } catch (err) {
        toast.error("Failed to import file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // Layout: Stack vertically on mobile, horizontally on desktop
  return (
    <div className="w-full flex flex-col md:flex-row md:items-start gap-6">
      <section
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-primary/40 rounded-lg p-6 bg-card/80 shadow mb-4 transition hover:border-primary cursor-pointer md:max-w-[420px]"
        tabIndex={0}
        aria-label="Upload CSV files"
        onClick={() => fileInputRef.current?.click()}
        role="button"
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
      >
        <span className="text-lg font-bold text-foreground mb-1">Upload Graph Data</span>
        <span className="text-sm text-muted-foreground">
          Drag & drop <b>nodes.csv</b> and <b>edges.csv</b> here, or click to browse
        </span>
        <input
          ref={fileInputRef}
          multiple
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onFiles}
          aria-label="Upload CSV files input"
        />
      </section>
      <div className="flex flex-col md:gap-3 gap-4 md:mt-0 mt-[-1.2rem] w-full max-w-[420px]">
        <SampleTabs onFillExample={fillExample} />
      </div>
      {/* ---- Global Settings Area (inline, no Sheet/panel) ---- */}
      <div className="w-full mt-6 flex flex-col gap-5 px-1 max-w-2xl">
        <section className="border border-border rounded-lg bg-card/80 shadow p-5 flex flex-col gap-4">
          <div className="flex flex-row items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold text-xl">Global Settings</span>
          </div>
          {/* Export/Import buttons */}
          <div className="flex flex-row gap-3 items-center">
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => importInputRef.current?.click()}
            >
              <Import className="w-4 h-4 mr-1" /> Import JSON
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
          {/* Appearance Presets */}
          <div className="flex flex-col gap-3">
            <span className="font-semibold text-base mt-1 mb-0.5">Appearance Presets</span>
            <AppearancePresetsSection />
          </div>
          <p className="text-xs text-muted-foreground">
            Export/import includes nodes, edges, and manual positions. Presets are experimental.
          </p>
        </section>
      </div>
    </div>
  );
};

export default UploadPanel;
