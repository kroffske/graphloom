
import React, { useCallback, useRef } from "react";
// FIX: Vite and ESM sometimes require star import for PapaParse
import * as Papa from "papaparse";
import { toast } from "sonner";
import { useGraphStore } from "@/state/useGraphStore";
import SampleCsvCard from "./SampleCsvCard";

// Helper: Only allow string | number | boolean
function castToSupportedType(val: unknown): string | number | boolean {
  if (typeof val === "string") {
    // Try number
    const num = Number(val);
    if (!isNaN(num) && val.trim() !== "") return num;
    // Try boolean
    if (val.toLowerCase() === "true") return true;
    if (val.toLowerCase() === "false") return false;
    return val;
  }
  if (typeof val === "number" || typeof val === "boolean") return val;
  // fallback
  return String(val);
}

// Reserved columns
const RESERVED_NODE_KEYS = ["node_id", "node_type", "label"];
const RESERVED_EDGE_KEYS = ["source", "target", "edge_type"];

const SAMPLE_NODES_CSV = `node_id,node_type,label,color,is_active
user1,entity,Alice,blue,true
user2,entity,Bob,green,false
app,external-system,My App,gray,true
event1,event,Login,,true
db,data-store,Users DB,,true
`;
const SAMPLE_NODES_DESC = `Required columns: node_id, node_type. Optional: label, plus custom attributes (e.g. color, is_active).
Each node_id must be unique.`;

const SAMPLE_EDGES_CSV = `source,target,edge_type,label
user1,event1,triggered,User Login
event1,app,initiated,
app,db,reads,App fetches user
user2,event1,triggered,
`;
const SAMPLE_EDGES_DESC = `Required columns: source, target. Optional: edge_type, label.
source/target must match node_id from nodes.csv.`;

const UploadPanel = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setNodes, setEdges } = useGraphStore();

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

    // Parse nodes.csv
    Papa.parse(nodeFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        const data = results.data as any[];
        // Defensive: no rows
        if (!data.length) {
          toast.error("nodes.csv has no data rows.");
          return;
        }
        const row0 = data[0];
        if (!row0?.node_id || !row0?.node_type) {
          toast.error("Invalid nodes.csv: must have node_id and node_type columns.");
          return;
        }
        // Basic check for duplicate ids
        const ids = new Set<string>();
        let hasInvalidRow = false;

        const nodes = data.map((row, idx) => {
          const nodeId = String(row.node_id);
          if (!nodeId || !row.node_type) {
            hasInvalidRow = true;
            return null;
          }
          // Warn on duplicate ids
          if (ids.has(nodeId)) {
            toast.error(`Duplicate node_id in row ${idx + 2}: "${nodeId}"`);
            hasInvalidRow = true;
          }
          ids.add(nodeId);
          // Allow users extra columns for attributes
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
        }).filter(Boolean); // non-null

        if (hasInvalidRow) {
          toast.error("One or more invalid node rows were found and skipped.");
        }

        setNodes(nodes as any); // Type is validated above
        toast.success("Loaded nodes.csv!");
      },
      error: () => toast.error("Failed to parse nodes.csv"),
    });

    // Parse edges.csv
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
        // Edge ids are artificial
        const edges = data.map((row, i) => {
          // Allow for edge_type column, and ignore extra columns for now
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
      <div className="flex flex-col md:gap-3 gap-4 md:mt-0 mt-[-1.2rem]">
        <SampleCsvCard title="Sample nodes.csv" description={SAMPLE_NODES_DESC} csv={SAMPLE_NODES_CSV} />
        <div className="md:h-2"></div>
        <SampleCsvCard title="Sample edges.csv" description={SAMPLE_EDGES_DESC} csv={SAMPLE_EDGES_CSV} />
      </div>
    </div>
  );
};

export default UploadPanel;
