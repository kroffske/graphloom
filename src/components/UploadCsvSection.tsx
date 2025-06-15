import React, { useRef, useCallback } from "react";
import * as Papa from "papaparse";
import { toast } from "sonner";
import { useGraphStore } from "@/state/useGraphStore";
import { SAMPLE_TAB_CSVS, SampleTabs } from "./SampleTabs";

// Utility used here and in parent; safe to copy for isolation
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

// Parse logic moved locally
function parseCsvData(nodesCsv: string, edgesCsv: string) {
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

type UploadCsvSectionProps = {
  onExample: (preset?: "example") => void;
};

const UploadCsvSection: React.FC<UploadCsvSectionProps> = ({ onExample }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setNodes, setEdges } = useGraphStore();

  // Helper for filename checking: match any "nodes" or "edges" file, regardless of case and extension
  function matchNodesOrEdges(name: string, type: "nodes" | "edges") {
    // strip extension and compare lowercase
    const nameLower = name.toLowerCase();
    if (type === "nodes") {
      return nameLower === "nodes" || nameLower === "nodes.csv";
    }
    if (type === "edges") {
      return nameLower === "edges" || nameLower === "edges.csv";
    }
    return false;
  }

  // Parse CSV and validate
  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    let nodeFile: File | null = null;
    let edgeFile: File | null = null;

    // Accept any file with basenames "nodes" or "edges" (case-insensitive, with or without .csv)
    for (let i = 0; i < files.length; i++) {
      const base = files[i].name.replace(/\.[^/.]+$/, "").toLowerCase();
      if (base === "nodes" && !nodeFile) nodeFile = files[i];
      if (base === "edges" && !edgeFile) edgeFile = files[i];
    }

    if (!nodeFile || !edgeFile) {
      toast.error("Please upload files named 'nodes' and 'edges' (with or without the .csv extension).");
      return;
    }

    Papa.parse(nodeFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        const data = results.data as any[];
        if (!data.length) {
          toast.error("nodes file has no data rows.");
          return;
        }
        const row0 = data[0];
        if (!row0?.node_id || !row0?.node_type) {
          toast.error("Invalid nodes file: must have node_id and node_type columns.");
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
        toast.success("Loaded nodes!");
      },
      error: () => toast.error("Failed to parse nodes file"),
    });

    Papa.parse(edgeFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        const data = results.data as any[];
        if (!data.length) {
          toast.error("edges file has no data rows.");
          return;
        }
        const row0 = data[0];
        if (!row0?.source || !row0?.target) {
          toast.error("Invalid edges file: must have source and target columns.");
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
        toast.success("Loaded edges!");
      },
      error: () => toast.error("Failed to parse edges file"),
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

  return (
    <div className="w-full md:w-[420px] flex flex-col gap-4">
      <section
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-primary/40 rounded-lg p-6 bg-card/80 shadow mb-2 transition hover:border-primary cursor-pointer"
        tabIndex={0}
        aria-label="Upload CSV files"
        onClick={() => fileInputRef.current?.click()}
        role="button"
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
      >
        <span className="text-lg font-bold text-foreground mb-1">Upload Graph Data</span>
        <span className="text-sm text-muted-foreground">
          Drag & drop <b>nodes</b> and <b>edges</b> files here (with or without <b>.csv</b>), or click to browse
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
      <SampleTabs onFillExample={() => onExample("example")} />
    </div>
  );
};

export default UploadCsvSection;
