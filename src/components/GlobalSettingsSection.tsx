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
// Add:
import EdgeTypeAppearanceSettings from "@/components/EdgeTypeAppearanceSettings";
import { useAppearancePresets } from "./GlobalSettings/useAppearancePresets";
import AppearanceImportExport from "./GlobalSettings/AppearanceImportExport";
import AppearanceSettingsColumns from "./GlobalSettings/AppearanceSettingsColumns";
import PresetJsonConfigTextarea from "./GlobalSettings/PresetJsonConfigTextarea";

// Node type labels for all built-in types (should match those in NodeTypeAppearanceSettings)
const NODE_TYPE_LABELS: Record<string, string> = {
  entity: "Entity",
  process: "Process",
  "data-store": "Data Store",
  event: "Event",
  decision: "Decision",
  "external-system": "External System"
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
  iconOrder: undefined
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
      config
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

const GlobalSettingsSection: React.FC<{ onFillExample: () => void }> = () => {
  const {
    completePresetObject,
    displayedPresets,
    selectedPresetKey,
    setSelectedPresetKey,
    selectedPresetObj,
    handlePresetSaveFromJson,
    handlePresetSelect,
  } = useAppearancePresets();

  // JSON textarea state/dirty logic
  const [editableJson, setEditableJson] = useState<string>(JSON.stringify(completePresetObject, null, 2));
  const [isDirty, setIsDirty] = useState(false);

  // Sync text with presets if not dirty
  useEffect(() => {
    if (!isDirty) {
      setEditableJson(JSON.stringify(completePresetObject, null, 2));
    }
  }, [completePresetObject, isDirty]);

  // Dropdown handler
  function handlePresetKeyDropdownChange(presetKey: string) {
    if (presetKey === selectedPresetKey) return;
    const preset = displayedPresets.find((p) => p.key === presetKey);
    if (preset) {
      handlePresetSelect(preset.config, preset.key, (nodeTypes, edgeTypes) => {
        setEditableJson(JSON.stringify({ nodeTypes, edgeTypes }, null, 2));
        setIsDirty(false);
      });
    }
  }

  return (
    <div className="w-full flex flex-col gap-5 px-1 flex-1 h-full">
      <section className="border border-border rounded-lg bg-card/80 shadow p-8 flex flex-col gap-6 w-full flex-1 h-full">
        <div className="flex flex-row items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold text-xl">Apearence</span>
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
        <div className="flex flex-col gap-3">
          <span className="font-semibold text-base mt-1 mb-0.5">Appearance Presets</span>
          <AppearancePresetsSection
            onPresetSelect={(config, key) => handlePresetSelect(config, key, (nodeTypes, edgeTypes) => {
              setEditableJson(JSON.stringify({ nodeTypes, edgeTypes }, null, 2));
              setIsDirty(false);
            })}
            selectedPresetKey={selectedPresetKey}
            appearancePresets={displayedPresets}
          />
        </div>
        <AppearanceImportExport />
        <AppearanceSettingsColumns onSaveCustomPresetFromJson={() => handlePresetSaveFromJson(editableJson, () => setIsDirty(false))} />
        <PresetJsonConfigTextarea
          editableJson={editableJson}
          setEditableJson={setEditableJson}
          isDirty={isDirty}
          setIsDirty={setIsDirty}
          completePresetObject={completePresetObject}
          onSaveCustomPresetFromJson={(jsonStr) => handlePresetSaveFromJson(jsonStr, () => setIsDirty(false))}
        />
        <p className="text-xs text-muted-foreground">
          Export/import includes nodes, edges, and manual positions. Presets are experimental. Now includes global edge appearance!
        </p>
      </section>
    </div>
  );
};

export default GlobalSettingsSection;

// NOTE: This file was refactored and is now much smaller.
// Please continue breaking down other large files to increase maintainability!
