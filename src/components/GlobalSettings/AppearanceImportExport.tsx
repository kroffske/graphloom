
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Import } from "lucide-react";
import { toast } from "sonner";
import { PresetConfig } from "@/types/appearance";

type Props = {
  completePresetObject: PresetConfig;
  onImport: (jsonString: string) => void;
};

export default function AppearanceImportExport({ completePresetObject, onImport }: Props) {
  const importInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    if (!completePresetObject) {
      toast.error("No preset data available to export.");
      return;
    }
    const payload = completePresetObject;
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const tempLink = document.createElement("a");
    tempLink.href = url;
    tempLink.download = "appearance-presets.json";
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    URL.revokeObjectURL(url);
    toast.success("Exported appearance presets as JSON.");
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const jsonString = String(evt.target?.result);
        const data = JSON.parse(jsonString);
        if (data.nodeTypes || data.edgeTypes) {
          onImport(jsonString);
          toast.success("Imported appearance presets!");
        } else {
          toast.error("Invalid file format: Missing nodeTypes or edgeTypes.");
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
        Export Presets
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => importInputRef.current?.click()}
      >
        <Import className="w-4 h-4 mr-1" /> Import Presets
      </Button>
      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportFile}
      />
    </div>
  );
}
