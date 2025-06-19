import React, { useRef, useCallback } from "react";
import * as Papa from "papaparse";
import { toast } from "sonner";
import { useGraphStore } from "@/state/useGraphStore";
import { SAMPLE_TAB_CSVS, SampleTabs } from "./SampleTabs";
import { Upload as UploadIcon } from "lucide-react";
import { castToSupportedType } from "@/utils/csvParser";
import { analyzeTimestampFields, findTimeRange } from "@/utils/timestampUtils";
import { GraphNode, GraphEdge } from "@/types/graph";

// Type for parsed CSV row data
type NodeCsvRow = {
  node_id: string;
  node_type: string;
  label?: string;
  [key: string]: unknown;
};

type EdgeCsvRow = {
  source: string;
  target: string;
  edge_type?: string;
  timestamp?: string;
  [key: string]: unknown;
};

type UploadCsvSectionProps = {
  onExample: (preset?: "example") => void;
};

const UploadCsvSection: React.FC<UploadCsvSectionProps> = ({ onExample }) => {
  const nodeFileInputRef = useRef<HTMLInputElement>(null);
  const edgeFileInputRef = useRef<HTMLInputElement>(null);

  // Updated: use filenames and setters from the graph store, not from local state
  const {
    setNodes, setEdges,
    nodeFilename, setNodeFilename,
    edgeFilename, setEdgeFilename,
  } = useGraphStore();

  // Parse CSV and validate (nodes)
  const processNodeFile = useCallback((file: File | null) => {
    if (!file) return;
    setNodeFilename(file.name); // now global!
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<NodeCsvRow>) => {
        const data = results.data;
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
            attributes[k] = castToSupportedType(v);
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
        setNodes(nodes as GraphNode[]);
        toast.success("Loaded nodes!");
      },
      error: () => toast.error("Failed to parse nodes.csv"),
    });
  }, [setNodes, setNodeFilename]);

  // Parse CSV and validate (edges)
  const processEdgeFile = useCallback((file: File | null) => {
    if (!file) return;
    setEdgeFilename(file.name); // now global!
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<EdgeCsvRow>) => {
        const data = results.data;
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
            attributes[k] = castToSupportedType(v);
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
        
        // Analyze timestamps in edges
        const timestampFields = analyzeTimestampFields(edges);
        if (timestampFields.length > 0) {
          // Use the field with highest coverage
          const bestField = timestampFields[0];
          useGraphStore.getState().setTimestampField(bestField.field);
          
          const timeRange = findTimeRange(edges, bestField.field);
          if (timeRange) {
            useGraphStore.getState().setTimeRange(timeRange);
            useGraphStore.getState().setSelectedTimeRange(timeRange);
            toast.success(`Loaded edges with timestamps from ${bestField.field} field!`);
          }
        } else {
          // Clear time range if no timestamps found
          useGraphStore.getState().setTimestampField(null);
          useGraphStore.getState().setTimeRange(null);
          useGraphStore.getState().setSelectedTimeRange(null);
          toast.success("Loaded edges!");
        }
      },
      error: () => toast.error("Failed to parse edges.csv"),
    });
  }, [setEdges, setEdgeFilename]);

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
        {nodeFilename && (
          <span className="text-xs text-accent mt-2">
            <span className="font-semibold">Selected file:</span> {nodeFilename}
          </span>
        )}
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
        {edgeFilename && (
          <span className="text-xs text-accent mt-2">
            <span className="font-semibold">Selected file:</span> {edgeFilename}
          </span>
        )}
      </section>
      {/* SampleTabs */}
      <div className="flex-grow">
        <SampleTabs onFillExample={() => onExample("example")} />
      </div>
    </div>
  );
};

export default UploadCsvSection;
