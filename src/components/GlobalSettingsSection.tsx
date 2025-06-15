import React, { useRef, useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AppearancePresetsSection from "@/components/AppearancePresetsSection";
import { Settings, Import, Save } from "lucide-react";
import NodeTypeAppearanceSettings from "@/components/NodeTypeAppearanceSettings";
import { Textarea } from "@/components/ui/textarea";
import { useGraphStore } from "@/state/useGraphStore";
import { toast } from "sonner";

// Node type labels for all built-in types (should match those in NodeTypeAppearanceSettings)
const NODE_TYPE_LABELS: Record<string, string> = {
  entity: "Entity",
  process: "Process",
  "data-store": "Data Store",
  event: "Event",
  decision: "Decision",
  "external-system": "External System",
};
// Default appearance for any type
const DEFAULTS = {
  icon: undefined,
  backgroundColor: "",
  lineColor: "",
  size: 64,
  labelField: "label",
  showIconCircle: false,
  iconCircleColor: "#e9e9e9",
  iconOrder: undefined,
};

type GlobalSettingsSectionProps = {
  onFillExample: () => void;
};

const GlobalSettingsSection: React.FC<GlobalSettingsSectionProps> = () => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const { setNodes, setEdges, nodes, edges, manualPositions, nodeTypeAppearances, setNodeTypeAppearance } = useGraphStore();

  // --- Appearance Preset Selection State ---
  const [selectedPresetKey, setSelectedPresetKey] = useState<string | undefined>(undefined);

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

  // --- Always show ALL node types (with custom, else defaults) in preset JSON ---
  const completePresetObject = useMemo(() => {
    // Get all known types (union of built-in and any custom appearances)
    const typeKeys = [
      ...new Set([
        ...Object.keys(NODE_TYPE_LABELS),
        ...Object.keys(nodeTypeAppearances ?? {}),
      ]),
    ];
    // Compose full object with user config overriding defaults
    const result: Record<string, any> = {};
    for (const type of typeKeys) {
      // If type config exists, merge over the default
      const config = nodeTypeAppearances?.[type] || {};
      result[type] = {
        ...DEFAULTS,
        icon: config.icon ?? type, // If unset, default the icon to type name
        ...config,
      };
    }
    return result;
  }, [nodeTypeAppearances]);

  // Local editable JSON state
  const [editableJson, setEditableJson] = useState<string>(
    JSON.stringify(completePresetObject, null, 2),
  );
  // Track if user edited
  const [isDirty, setIsDirty] = useState(false);
  // When the preset object changes (e.g. after changes/reset), update JSON view if NOT dirty
  useEffect(() => {
    if (!isDirty) {
      setEditableJson(JSON.stringify(completePresetObject, null, 2));
    }
  }, [completePresetObject, isDirty]);

  // Handler for copying JSON config
  function handleCopyPreset() {
    try {
      navigator.clipboard.writeText(editableJson);
      toast.success("Appearance preset JSON copied!");
    } catch {
      toast.error("Unable to copy JSON!");
    }
  }

  function handleJsonChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setEditableJson(e.target.value);
    setIsDirty(true);
  }

  function handlePresetSave() {
    try {
      const data = JSON.parse(editableJson);
      if (typeof data !== "object" || !data) throw new Error();
      // For each key, set appearance
      Object.entries(data).forEach(([type, config]) => {
        setNodeTypeAppearance(type, config);
      });
      toast.success("Preset JSON saved!");
      setIsDirty(false);
    } catch (err) {
      toast.error("Invalid JSON format or content.");
    }
  }

  // --- Handler to load a selected preset ---
  function handlePresetSelect(presetConfig: Record<string, any>, presetKey: string) {
    // Overwrite nodeTypeAppearances for every type in presetConfig
    Object.entries(presetConfig).forEach(([type, config]) => {
      setNodeTypeAppearance(type, config);
    });
    toast.success("Preset loaded!");
    setEditableJson(JSON.stringify({
      ...completePresetObject,
      ...presetConfig
    }, null, 2));
    setIsDirty(false);

    // Set selected preset key for highlight
    setSelectedPresetKey(presetKey);
  }

  return (
    <div className="w-full md:w-[650px] min-w-[340px] mt-0 flex flex-col gap-5 px-1 max-w-4xl">
      <section className="border border-border rounded-lg bg-card/80 shadow p-5 flex flex-col gap-4">
        <div className="flex flex-row items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold text-xl">Global Settings</span>
        </div>
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
        <div className="flex flex-col gap-3">
          {/* Only ONE heading, not duplicated */}
          <span className="font-semibold text-base mt-1 mb-0.5">Appearance Presets</span>
          <AppearancePresetsSection
            onPresetSelect={handlePresetSelect}
            selectedPresetKey={selectedPresetKey}
          />
        </div>
        <div className="w-full flex flex-col md:flex-row gap-6 mt-2">
          <div className="w-full md:w-1/2 flex-shrink-0">
            <NodeTypeAppearanceSettings />
          </div>
          <div className="w-full md:w-1/2 flex flex-col min-w-[240px] max-w-[520px]">
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="font-semibold text-base">Preset JSON Config</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPreset}
                  type="button"
                >Copy</Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePresetSave}
                  type="button"
                >
                  <Save className="w-4 h-4 mr-1" /> Save
                </Button>
              </div>
            </div>
            <Textarea
              value={editableJson}
              onChange={handleJsonChange}
              className="bg-muted resize-none font-mono text-xs min-h-[300px] max-h-[600px] h-full"
              style={{ minWidth: "170px" }}
              spellCheck={false}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Export/import includes nodes, edges, and manual positions. Presets are experimental.
        </p>
      </section>
    </div>
  );
};

export default GlobalSettingsSection;
