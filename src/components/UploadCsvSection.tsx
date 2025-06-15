
import React, { useRef, useCallback } from "react";
import * as Papa from "papaparse";
import { toast } from "sonner";
import { useGraphStore } from "@/state/useGraphStore";
import { SAMPLE_TAB_CSVS, SampleTabs } from "./SampleTabs";
import { Upload as UploadIcon } from "lucide-react";

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
  // Now: include all CSV columns as edge "attributes", except our base keys
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

type UploadCsvSectionProps = {
  onExample: (preset?: "example") => void;
};

const UploadCsvSection: React.FC<UploadCsvSectionProps> = ({ onExample }) => {
  const nodeFileInputRef = useRef<HTMLInputElement>(null);
  const edgeFileInputRef = useRef<HTMLInputElement>(null);
  const { setNodes, setEdges } = useGraphStore();

  // Parse CSV and validate (nodes)
  const processNodeFile = useCallback((file: File | null) => {
    if (!file) return;
    Papa.parse(file, {
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
          toast.warning("One or more invalid node rows were skipped.");
        }

        setNodes(nodes as any);
        toast.success("Loaded nodes!");
      },
      error: () => toast.error("Failed to parse nodes.csv"),
    });
  }, [setNodes]);

  // Parse CSV and validate (edges)
  const processEdgeFile = useCallback((file: File | null) => {
    if (!file) return;
    Papa.parse(file, {
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
        setEdges(edges);
        toast.success("Loaded edges!");
      },
      error: () => toast.error("Failed to parse edges.csv"),
    });
  }, [setEdges]);

  // File selection handlers
  const onNodeFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    processNodeFile(file);
    e.target.value = ""; // clear selection
  }, [processNodeFile]);

  const onEdgeFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    processEdgeFile(file);
    e.target.value = "";
  }, [processEdgeFile]);

  // Drag & drop handlers for each uploader
  const onDropNode = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0] || null;
      processNodeFile(file);
    },
    [processNodeFile]
  );

  const onDropEdge = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0] || null;
      processEdgeFile(file);
    },
    [processEdgeFile]
  );

  return (
    <div className="flex flex-col flex-1 gap-4 h-full w-full">
      {/* Node uploader */}
      <section
        onDrop={onDropNode}
        onDragOver={e => e.preventDefault()}
        className="flex flex-col flex-1 items-center justify-center gap-3 border-2 border-dashed border-primary/40 rounded-lg p-6 bg-card/80 shadow mb-1 transition hover:border-primary cursor-pointer w-full min-h-[120px]"
        tabIndex={0}
        aria-label="Upload nodes.csv"
        onClick={() => nodeFileInputRef.current?.click()}
        role="button"
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") nodeFileInputRef.current?.click(); }}
      >
        <UploadIcon className="w-6 h-6 text-primary mb-1" />
        <span className="text-lg font-semibold text-foreground">Upload nodes.csv</span>
        <span className="text-xs text-muted-foreground text-center pb-1">
          Drag & drop your <b>nodes.csv</b> file here,<br />or click to browse.
        </span>
        <input
          ref={nodeFileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onNodeFile}
          aria-label="Upload nodes CSV file"
        />
      </section>
      {/* Edge uploader */}
      <section
        onDrop={onDropEdge}
        onDragOver={e => e.preventDefault()}
        className="flex flex-col flex-1 items-center justify-center gap-3 border-2 border-dashed border-primary/40 rounded-lg p-6 bg-card/80 shadow mb-1 transition hover:border-primary cursor-pointer w-full min-h-[120px]"
        tabIndex={0}
        aria-label="Upload edges.csv"
        onClick={() => edgeFileInputRef.current?.click()}
        role="button"
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") edgeFileInputRef.current?.click(); }}
      >
        <UploadIcon className="w-6 h-6 text-primary mb-1" />
        <span className="text-lg font-semibold text-foreground">Upload edges.csv</span>
        <span className="text-xs text-muted-foreground text-center pb-1">
          Drag & drop your <b>edges.csv</b> file here,<br />or click to browse.
        </span>
        <input
          ref={edgeFileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onEdgeFile}
          aria-label="Upload edges CSV file"
        />
      </section>
      {/* SampleTabs */}
      <div className="flex-grow">
        <SampleTabs onFillExample={() => onExample("example")} />
      </div>
    </div>
  );
};

export default UploadCsvSection;

// File is now 245+ lines and getting long.
// After this you should consider refactoring it into smaller files for maintainability.

