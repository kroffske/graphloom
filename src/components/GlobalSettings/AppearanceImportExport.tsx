
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Import } from "lucide-react";
import { toast } from "sonner";
import { useGraphStore } from "@/state/useGraphStore";

type Props = {};

export default function AppearanceImportExport({}: Props) {
  const importInputRef = useRef<HTMLInputElement>(null);
  const { setNodes, setEdges, nodes, edges, manualPositions } = useGraphStore();
  function handleExport() {
    const payload = { nodes, edges, manualPositions, timestamp: Date.now() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
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
  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(String(evt.target?.result));
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
          toast.success("Imported graph data!");
        } else {
          toast.error("Invalid file format: Missing nodes or edges.");
        }
      } catch {
        toast.error("Failed to import file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }
  return (
    <div className="flex flex-row items-center gap-3 mb-2 mt-1">
      <Button variant="outline" size="sm" onClick={handleExport}>
        Export JSON
      </Button>
      <Button variant="outline" size="sm" onClick={() => importInputRef.current?.click()}>
        <Import className="w-4 h-4 mr-1" /> Import JSON
      </Button>
      <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
    </div>
  );
}
