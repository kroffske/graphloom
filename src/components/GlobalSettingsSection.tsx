
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AppearancePresetsSection from "@/components/AppearancePresetsSection";
import { Settings } from "lucide-react";
import NodeTypeAppearanceSettings from "@/components/NodeTypeAppearanceSettings";
import EdgeTypeAppearanceSettings from "@/components/EdgeTypeAppearanceSettings";
import AppearanceImportExport from "./GlobalSettings/AppearanceImportExport";
import PresetJsonConfigTextarea from "./GlobalSettings/PresetJsonConfigTextarea";
import { useAppearanceManager } from "@/hooks/appearance/useAppearanceManager";
import AppearancePresetDropdown from "./AppearancePresetDropdown";

const GlobalSettingsSection: React.FC<{ onFillExample: () => void }> = () => {
  const {
    // Node
    nodeTypeKeys,
    nodeTypeLabels,
    selectedNodeType,
    setSelectedNodeType,
    selectedNodeTypeAppearance,
    updateNodeTypeAppearance,
    resetNodeTypeAppearance,
    // Edge
    edgeTypeKeys,
    selectedEdgeType,
    setSelectedEdgeType,
    updateEdgeTypeAppearance,
    resetEdgeTypeAppearance,
    // Presets
    completePresetObject,
    displayedPresets,
    selectedPresetKey,
    selectedPresetObj,
    handlePresetSaveFromJson,
    handlePresetSelect,
  } = useAppearanceManager();

  // JSON textarea state/dirty logic
  const [editableJson, setEditableJson] = useState<string>(
    JSON.stringify(completePresetObject, null, 2)
  );
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
      handlePresetSelect(
        preset.config,
        preset.key,
        (nodeTypes, edgeTypes) => {
          setEditableJson(JSON.stringify({ nodeTypes, edgeTypes }, null, 2));
          setIsDirty(false);
        }
      );
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full gap-5 px-1 h-full">
      <section className="flex flex-col flex-1 min-h-0 h-full w-full border border-border rounded-lg bg-card/80 shadow p-8 gap-6">
        <div className="flex flex-row items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold text-xl">Appearance</span>
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
          <span className="font-semibold text-base mt-1 mb-0.5">
            Appearance Presets
          </span>
          <AppearancePresetsSection
            onPresetSelect={(config, key) =>
              handlePresetSelect(config, key, (nodeTypes, edgeTypes) => {
                setEditableJson(
                  JSON.stringify({ nodeTypes, edgeTypes }, null, 2)
                );
                setIsDirty(false);
              })
            }
            selectedPresetKey={selectedPresetKey}
            appearancePresets={displayedPresets}
          />
        </div>
        <AppearanceImportExport />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <NodeTypeAppearanceSettings
            onSave={updateNodeTypeAppearance}
            onReset={resetNodeTypeAppearance}
            selectedType={selectedNodeType}
            setSelectedType={setSelectedNodeType}
            appearance={selectedNodeTypeAppearance}
            nodeTypeKeys={nodeTypeKeys}
            nodeTypeLabels={nodeTypeLabels}
          />
          <EdgeTypeAppearanceSettings
            onSave={updateEdgeTypeAppearance}
            onReset={resetEdgeTypeAppearance}
            selectedType={selectedEdgeType}
            setSelectedType={setSelectedEdgeType}
            allTypes={edgeTypeKeys}
          />
        </div>
        <PresetJsonConfigTextarea
          editableJson={editableJson}
          setEditableJson={setEditableJson}
          isDirty={isDirty}
          setIsDirty={setIsDirty}
          completePresetObject={completePresetObject}
          onSaveCustomPresetFromJson={(jsonStr) =>
            handlePresetSaveFromJson(jsonStr, () => setIsDirty(false))
          }
        />
        <p className="text-xs text-muted-foreground">
          Export/import includes nodes, edges, and manual positions. Presets
          are experimental. Now includes global edge appearance!
        </p>
      </section>
    </div>
  );
};

export default GlobalSettingsSection;
