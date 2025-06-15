
import React, { useCallback, useRef } from "react";
// FIX: Vite and ESM sometimes require star import for PapaParse
import * as Papa from "papaparse";
import { toast } from "sonner";
import { useGraphStore } from "@/state/useGraphStore";

// Basic Dropzone for CSV files
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
        // Basic validation
        if (!data[0]?.node_id || !data[0]?.node_type) {
          toast.error("Invalid nodes.csv: must have node_id and node_type columns.");
          return;
        }
        setNodes(
          data.map((row) => ({
            id: String(row.node_id),
            type: String(row.node_type),
            label: row.label || row.node_id,
            attributes: Object.fromEntries(
              Object.entries(row).filter(
                ([k]) => !["node_id", "node_type", "label"].includes(k)
              )
            ),
          }))
        );
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
        if (!data[0]?.source || !data[0]?.target) {
          toast.error("Invalid edges.csv: must have source and target columns.");
          return;
        }
        setEdges(
          data.map((row, i) => ({
            id: `e${i + 1}`,
            source: String(row.source),
            target: String(row.target),
            type: row.edge_type || "default",
          }))
        );
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

  return (
    <section
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
      className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-primary/40 rounded-lg p-6 bg-card/80 shadow mb-4 transition hover:border-primary cursor-pointer"
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
  );
};

export default UploadPanel;
