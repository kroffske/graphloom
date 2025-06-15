
import React, { useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import AppearancePresetsSection from "./AppearancePresetsSection";
import { useGraphStore } from "@/state/useGraphStore";

type GlobalSettingsPanelProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const GlobalSettingsPanel: React.FC<GlobalSettingsPanelProps> = ({ open, onOpenChange }) => {
  const { nodes, edges, setNodes, setEdges, manualPositions } = useGraphStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // Reset input value so same file can be re-imported
    e.target.value = "";
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] max-w-full flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle>Global Settings</SheetTitle>
        </SheetHeader>
        {/* Import/Export */}
        <section className="flex flex-row items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExport}>Export JSON</Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFile}
          />
        </section>
        <AppearancePresetsSection />
        <div className="flex-1" />
        <p className="text-xs text-muted-foreground mt-2">
          Export/import includes nodes, edges, and manual positions. Presets are experimental.
        </p>
      </SheetContent>
    </Sheet>
  );
};

export default GlobalSettingsPanel;
