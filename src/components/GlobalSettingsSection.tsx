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

// Local storage key for selected appearance preset
const SELECTED_PRESET_LOCAL_KEY = "lovable_selected_preset_key";

function getPersistedSelectedPresetKey(): string | null {
  try {
    return localStorage.getItem(SELECTED_PRESET_LOCAL_KEY);
  } catch {
    return null;
  }
}
function persistSelectedPresetKey(selectedKey: string) {
  try {
    localStorage.setItem(SELECTED_PRESET_LOCAL_KEY, selectedKey);
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

  const [customPreset, setCustomPreset] = useState<CustomPreset | null>(() => getPersistedCustomPreset());
  const [selectedPresetKey, setSelectedPresetKey] = useState<string | undefined>(undefined);

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

  // --- Augment list to include a 'custom' preset if it exists ---
  const displayedPresets = useMemo(() => {
    const presets = [...appearancePresets];
    if (customPreset) {
      return [customPreset, ...presets];
    }
    return presets;
  }, [customPreset]);

  // Ensure selectedPresetKey has a value on mount and after preset changes.
  useEffect(() => {
    // Only set from persisted value on initial mount (not on every change)
    if (selectedPresetKey === undefined) {
      const persistedKey = getPersistedSelectedPresetKey();
      const hasPersisted = persistedKey && displayedPresets.find(p => p.key === persistedKey);
      if (hasPersisted) {
        setSelectedPresetKey(persistedKey);
      } else if (displayedPresets.length > 0) {
        setSelectedPresetKey(displayedPresets[0].key);
        persistSelectedPresetKey(displayedPresets[0].key);
      }
    } else {
      // If selected key no longer exists (e.g., preset deleted), switch to first available
      const found = displayedPresets.find(p => p.key === selectedPresetKey);
      if (!found && displayedPresets.length > 0) {
        setSelectedPresetKey(displayedPresets[0].key);
        persistSelectedPresetKey(displayedPresets[0].key);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedPresets]);

  // If user changed preset, persist the key.
  useEffect(() => {
    if (selectedPresetKey && displayedPresets.some(p => p.key === selectedPresetKey)) {
      persistSelectedPresetKey(selectedPresetKey);
    }
  }, [selectedPresetKey, displayedPresets]);

  // Find selected preset object by key; fallback to null
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

  const [editableJson, setEditableJson] = useState<string>(
    JSON.stringify(completePresetObject, null, 2),
  );
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isDirty) {
      setEditableJson(JSON.stringify(completePresetObject, null, 2));
    }
  }, [completePresetObject, isDirty]);

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
      updateAllNodeAppearances(data);
      toast.success("Preset JSON saved!");
      setIsDirty(false);
      setSelectedPresetKey(CUSTOM_PRESET_KEY);
      persistSelectedPresetKey(CUSTOM_PRESET_KEY);
    } catch (err) {
      toast.error("Invalid JSON format or content.");
    }
  // Dependencies updated for persistSelectedPresetKey
  }, [
    editableJson,
    setNodeTypeAppearance,
    setCustomPreset,
    setIsDirty,
    setSelectedPresetKey,
    updateAllNodeAppearances,
  ]);

  function handlePresetSelect(presetConfig: Record<string, any>, presetKey: string) {
    Object.entries(presetConfig).forEach(([type, config]) => {
      setNodeTypeAppearance(type, config);
    });
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
    setSelectedPresetKey(presetKey);
    persistSelectedPresetKey(presetKey);
  }

  function handlePresetKeyDropdownChange(presetKey: string) {
    if (presetKey === selectedPresetKey) return;
    const preset = displayedPresets.find((p) => p.key === presetKey);
    if (preset) {
      handlePresetSelect(preset.config, preset.key);
    }
  }

  useEffect(() => {
    const loaded = getPersistedCustomPreset();
    if (loaded) setCustomPreset(loaded);
    // Don't set initial preset key here; handled above
  }, []);

  return (
    <div className="w-full md:w-[650px] min-w-[340px] mt-0 flex flex-col gap-5 px-1 max-w-4xl">
      <section className="border border-border rounded-lg bg-card/80 shadow p-5 flex flex-col gap-4">
        <div className="flex flex-row items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold text-xl">Global Settings</span>
        </div>
        <div className="flex flex-row items-center gap-3 mb-2">
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

// NOTE: This file is getting too long (372+ lines).
// Please consider asking me to refactor it into smaller files for maintainability after these changes.
