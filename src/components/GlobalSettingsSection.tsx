import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import AppearancePresetsSection from "@/components/AppearancePresetsSection";
import { Settings, Import, Save } from "lucide-react";
import NodeTypeAppearanceSettings from "@/components/NodeTypeAppearanceSettings";
import { Textarea } from "@/components/ui/textarea";
import { useGraphStore } from "@/state/useGraphStore";
import { toast } from "sonner";
import { appearancePresets } from "@/data/appearancePresets";
import AppearancePresetDropdown from "./AppearancePresetDropdown";

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

type CustomPreset = {
  name: string;
  key: string;
  config: Record<string, any>;
};

type GlobalSettingsSectionProps = {
  onFillExample: () => void;
};

const CUSTOM_PRESET_KEY = "custom";

// Persist the custom preset locally for current session and reloads, using localStorage.
function getPersistedCustomPreset(): CustomPreset | null {
  try {
    const str = localStorage.getItem("lovable_custom_preset");
    if (!str) return null;
    const config = JSON.parse(str);
    return {
      name: "Custom",
      key: CUSTOM_PRESET_KEY,
      config,
    };
  } catch {
    return null;
  }
}

function persistCustomPreset(config: Record<string, any>) {
  try {
    localStorage.setItem("lovable_custom_preset", JSON.stringify(config));
  } catch {}
}

const GlobalSettingsSection: React.FC<GlobalSettingsSectionProps> = () => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const {
    setNodes,
    setEdges,
    nodes,
    edges,
    manualPositions,
    nodeTypeAppearances,
    setNodeTypeAppearance,
  } = useGraphStore();

  // --- Appearance Preset Selection State ---
  // Augment list to include a 'custom' preset if it exists
  const [customPreset, setCustomPreset] = useState<CustomPreset | null>(() => getPersistedCustomPreset());
  // selectedPresetKey points to Preset key, can be any preset or "custom"
  const [selectedPresetKey, setSelectedPresetKey] = useState<string | undefined>(undefined);

  // --- Helper: find selected preset's name ---
  const displayedPresets = useMemo(() => {
    const presets = [...appearancePresets];
    if (customPreset) {
      return [customPreset, ...presets];
    }
    return presets;
  }, [customPreset]);

  // Find selected preset object by key; fallback to 'Custom'
  const selectedPresetObj = useMemo(() => {
    if (!selectedPresetKey) return null;
    return displayedPresets.find((p) => p.key === selectedPresetKey) || null;
  }, [selectedPresetKey, displayedPresets]);

  // === Helper: sync appearances into all nodes ===
  const updateAllNodeAppearances = useCallback(
    (appearanceMap: Record<string, any>) => {
      setNodes(
        nodes.map((n) => ({
          ...n,
          appearance: appearanceMap[n.type] ? { ...appearanceMap[n.type] } : {},
        }))
      );
    },
    [nodes, setNodes]
  );

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

  // Expose this handler so child forms can call it
  const handlePresetSave = useCallback(() => {
    try {
      const data = JSON.parse(editableJson);
      if (typeof data !== "object" || !data) throw new Error();
      Object.entries(data).forEach(([type, config]) => {
        setNodeTypeAppearance(type, config);
      });
      persistCustomPreset(data);
      setCustomPreset({
        name: "Custom",
        key: CUSTOM_PRESET_KEY,
        config: data,
      });
      // --- NEW: Apply to all nodes for immediate update ---
      updateAllNodeAppearances(data);

      toast.success("Preset JSON saved!");
      setIsDirty(false);
      setSelectedPresetKey(CUSTOM_PRESET_KEY);
    } catch (err) {
      toast.error("Invalid JSON format or content.");
    }
  }, [
    editableJson,
    setNodeTypeAppearance,
    setCustomPreset,
    setIsDirty,
    setSelectedPresetKey,
    updateAllNodeAppearances,
  ]);

  // Handler to load a selected preset
  function handlePresetSelect(presetConfig: Record<string, any>, presetKey: string) {
    Object.entries(presetConfig).forEach(([type, config]) => {
      setNodeTypeAppearance(type, config);
    });
    // --- NEW: Apply to all nodes for immediate update ---
    updateAllNodeAppearances(presetConfig);

    toast.success("Preset loaded!");
    setEditableJson(
      JSON.stringify(
        {
          ...completePresetObject,
          ...presetConfig,
        },
        null,
        2
      )
    );
    setIsDirty(false);
    if (presetKey === CUSTOM_PRESET_KEY) {
      setSelectedPresetKey(CUSTOM_PRESET_KEY);
    } else {
      setSelectedPresetKey(presetKey);
    }
  }

  // Handler to load a selected preset by *key* from dropdown
  function handlePresetKeyDropdownChange(presetKey: string) {
    const preset = displayedPresets.find((p) => p.key === presetKey);
    if (preset) {
      handlePresetSelect(preset.config, preset.key);
    }
  }

  // On mount, try to load persisted custom preset once
  useEffect(() => {
    const loaded = getPersistedCustomPreset();
    if (loaded) setCustomPreset(loaded);
  }, []);

  return (
    <div className="w-full md:w-[650px] min-w-[340px] mt-0 flex flex-col gap-5 px-1 max-w-4xl">
      <section className="border border-border rounded-lg bg-card/80 shadow p-5 flex flex-col gap-4">
        <div className="flex flex-row items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold text-xl">Global Settings</span>
        </div>
        <div className="flex flex-row items-center gap-3 mb-2">
          {/* Dropdown for selecting preset */}
          <AppearancePresetDropdown
            presets={displayedPresets}
            selectedKey={selectedPresetKey}
            onSelect={handlePresetKeyDropdownChange}
          />
          <span className="inline-flex items-center rounded bg-primary/10 text-primary font-semibold px-3 py-0.5 text-sm">
            {selectedPresetObj?.name ?? "—"}
          </span>
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
          <span className="font-semibold text-base mt-1 mb-0.5">Appearance Presets</span>
          <AppearancePresetsSection
            onPresetSelect={handlePresetSelect}
            selectedPresetKey={selectedPresetKey}
            appearancePresets={displayedPresets}
          />
        </div>
        <div className="w-full flex flex-col md:flex-row gap-6 mt-2">
          <div className="w-full md:w-1/2 flex-shrink-0">
            <NodeTypeAppearanceSettings
              onSaveCustomPresetFromJson={handlePresetSave}
            />
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

// NOTE: This file is getting too long (363+ lines).
// Please consider asking me to refactor it into smaller files for maintainability after these changes.
