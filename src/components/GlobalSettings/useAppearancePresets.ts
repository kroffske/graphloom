import { useCallback, useMemo, useEffect, useState } from "react";
import { appearancePresets } from "@/data/appearancePresets";
import { toast } from "sonner";
import { useGraphStore } from "@/state/useGraphStore";

// Node type labels for all built-in types
const NODE_TYPE_LABELS: Record<string, string> = {
  entity: "Entity",
  process: "Process",
  "data-store": "Data Store",
  event: "Event",
  decision: "Decision",
  "external-system": "External System"
};
const CUSTOM_PRESET_KEY = "custom";
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
function getPersistedCustomPreset() {
  try {
    const str = localStorage.getItem("lovable_custom_preset");
    if (!str) return null;
    const config = JSON.parse(str);
    return { name: "Custom", key: CUSTOM_PRESET_KEY, config };
  } catch {
    return null;
  }
}
function persistCustomPreset(config: Record<string, any>) {
  try {
    localStorage.setItem("lovable_custom_preset", JSON.stringify(config));
  } catch {}
}
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

export function useAppearancePresets() {
  const {
    nodeTypeAppearances,
    edgeTypeAppearances,
    setNodeTypeAppearance,
    setEdgeTypeAppearance,
    setNodes,
    nodes
  } = useGraphStore();

  const [customPreset, setCustomPreset] = useState(() => getPersistedCustomPreset());
  const [selectedPresetKey, setSelectedPresetKey] = useState<string | undefined>(undefined);

  // Compose complete preset object for node types
  const completePresetObject = useMemo(() => {
    const typeKeys = [...new Set([...Object.keys(NODE_TYPE_LABELS), ...Object.keys(nodeTypeAppearances ?? {})])];
    const result: Record<string, any> = {};
    for (const type of typeKeys) {
      const config = nodeTypeAppearances?.[type] || {};
      result[type] = { ...DEFAULTS, icon: config.icon ?? type, ...config };
    }
    return result;
  }, [nodeTypeAppearances]);

  const completeEdgeTypeAppearance = edgeTypeAppearances ?? {};

  // Preset list with custom
  const displayedPresets = useMemo(() => {
    const presets = [...appearancePresets];
    if (customPreset) return [customPreset, ...presets];
    return presets;
  }, [customPreset]);
  // Set selected on load / change
  useEffect(() => {
    if (selectedPresetKey === undefined) {
      const persistedKey = getPersistedSelectedPresetKey();
      const hasPersisted = persistedKey && displayedPresets.find(p => p.key === persistedKey);
      if (hasPersisted) setSelectedPresetKey(persistedKey);
      else if (displayedPresets.length > 0) {
        setSelectedPresetKey(displayedPresets[0].key);
        persistSelectedPresetKey(displayedPresets[0].key);
      }
    } else {
      const found = displayedPresets.find(p => p.key === selectedPresetKey);
      if (!found && displayedPresets.length > 0) {
        setSelectedPresetKey(displayedPresets[0].key);
        persistSelectedPresetKey(displayedPresets[0].key);
      }
    }
    // eslint-disable-next-line
  }, [displayedPresets]);

  useEffect(() => {
    if (selectedPresetKey && displayedPresets.some(p => p.key === selectedPresetKey)) {
      persistSelectedPresetKey(selectedPresetKey);
    }
  }, [selectedPresetKey, displayedPresets]);

  const selectedPresetObj = useMemo(() => {
    if (!selectedPresetKey) return null;
    return displayedPresets.find(p => p.key === selectedPresetKey) || null;
  }, [selectedPresetKey, displayedPresets]);

  // Update all nodes to use new appearances
  const updateAllNodeAppearances = useCallback((appearanceMap: Record<string, any>) => {
    setNodes(nodes.map(n => ({
      ...n,
      appearance: appearanceMap[n.type] ? { ...appearanceMap[n.type] } : {},
    })));
  }, [nodes, setNodes]);

  // Save from preset JSON (nodeTypes/edgeTypes shape or flat)
  const handlePresetSaveFromJson = useCallback((jsonStr: string, onDone?: () => void) => {
    try {
      const data = JSON.parse(jsonStr);
      let nodeTypes = data.nodeTypes || {};
      let edgeTypes = data.edgeTypes || {};
      if (!data.nodeTypes && !data.edgeTypes) {
        nodeTypes = data;
        edgeTypes = {};
      }
      if (typeof nodeTypes !== "object" || typeof edgeTypes !== "object") throw new Error();
      Object.entries(nodeTypes).forEach(([type, config]) => {
        setNodeTypeAppearance(type, config);
      });
      Object.entries(edgeTypes).forEach(([type, config]) => {
        setEdgeTypeAppearance(type, config as any);
      });
      persistCustomPreset({ nodeTypes, edgeTypes });
      setCustomPreset({
        name: "Custom",
        key: CUSTOM_PRESET_KEY,
        config: { nodeTypes, edgeTypes }
      });
      updateAllNodeAppearances(nodeTypes);
      toast.success("Preset JSON saved!");
      if (onDone) onDone();
      setSelectedPresetKey(CUSTOM_PRESET_KEY);
      persistSelectedPresetKey(CUSTOM_PRESET_KEY);
      return true;
    } catch {
      toast.error("Invalid JSON format or content.");
      return false;
    }
  }, [setNodeTypeAppearance, setEdgeTypeAppearance, setCustomPreset, updateAllNodeAppearances]);

  // Load preset config by object
  const handlePresetSelect = useCallback(
    (presetConfig: Record<string, any>, presetKey: string, onDone?: (nodeTypes: any, edgeTypes: any) => void) => {
      let nodeTypes = presetConfig.nodeTypes || {};
      let edgeTypes = presetConfig.edgeTypes || {};
      if (!presetConfig.nodeTypes && !presetConfig.edgeTypes) {
        nodeTypes = presetConfig;
        edgeTypes = {};
      }
      Object.entries(nodeTypes).forEach(([type, config]) => {
        setNodeTypeAppearance(type, config);
      });
      Object.entries(edgeTypes).forEach(([type, config]) => {
        setEdgeTypeAppearance(type, config as any);
      });
      updateAllNodeAppearances(nodeTypes);
      toast.success("Preset loaded!");
      if (onDone) onDone(nodeTypes, edgeTypes);
      setSelectedPresetKey(presetKey);
      persistSelectedPresetKey(presetKey);
    },
    [setNodeTypeAppearance, setEdgeTypeAppearance, updateAllNodeAppearances]
  );

  const updateNodeTypeAndSave = useCallback((type: string, appearance: object) => {
    const newCompleteObject = { ...completePresetObject, [type]: { ...DEFAULTS, ...completePresetObject[type], ...appearance } };
    
    const presetToSave = {
        nodeTypes: newCompleteObject,
        edgeTypes: completeEdgeTypeAppearance,
    };
    
    const success = handlePresetSaveFromJson(JSON.stringify(presetToSave, null, 2));
    if (success) {
      toast.success(`Appearance for ${NODE_TYPE_LABELS[type] || type} saved to custom preset.`);
    }

  }, [completePresetObject, completeEdgeTypeAppearance, handlePresetSaveFromJson]);

  useEffect(() => {
    const loaded = getPersistedCustomPreset();
    if (loaded) setCustomPreset(loaded);
  }, []);

  return {
    completePresetObject,
    completeEdgeTypeAppearance,
    displayedPresets,
    selectedPresetKey,
    setSelectedPresetKey,
    selectedPresetObj,
    handlePresetSaveFromJson,
    handlePresetSelect,
    updateNodeTypeAndSave,
    customPreset,
    setCustomPreset,
    updateAllNodeAppearances,
    persistCustomPreset,
  };
}
