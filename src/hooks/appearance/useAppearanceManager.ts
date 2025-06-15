
import { useCallback, useMemo, useEffect, useState } from "react";
import { appearancePresets } from "@/data/appearancePresets";
import { toast } from "sonner";
import { useGraphStore } from "@/state/useGraphStore";
import {
  NodeTypeAppearance,
  EdgeTypeAppearance,
  Preset,
  PresetConfig,
} from "@/types/appearance";

// Node type labels for all built-in types
const NODE_TYPE_LABELS: Record<string, string> = {
  entity: "Entity",
  process: "Process",
  "data-store": "Data Store",
  event: "Event",
  decision: "Decision",
  "external-system": "External System",
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
  iconOrder: undefined,
};
function getPersistedCustomPreset(): Preset | null {
  try {
    const str = localStorage.getItem("lovable_custom_preset");
    if (!str) return null;
    const config = JSON.parse(str);
    return { name: "Custom", key: CUSTOM_PRESET_KEY, config };
  } catch {
    return null;
  }
}
function persistCustomPreset(config: PresetConfig) {
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

export function useAppearanceManager() {
  const {
    nodes,
    edges,
    nodeTypeAppearances,
    edgeTypeAppearances,
    setNodeTypeAppearance,
    setEdgeTypeAppearance,
    resetNodeTypeAppearance,
    resetEdgeTypeAppearance,
    setNodes,
  } = useGraphStore();

  const [customPreset, setCustomPreset] = useState(() =>
    getPersistedCustomPreset()
  );
  const [selectedPresetKey, setSelectedPresetKey] = useState<
    string | undefined
  >(undefined);
  
  // --- Node Type Logic ---
  const nodeTypeKeys = useMemo(() => {
    const builtIn = Object.keys(NODE_TYPE_LABELS);
    const fromAppearances = Object.keys(nodeTypeAppearances ?? {});
    const fromNodes = nodes.map((n) => n.type);
    let fromPresetJson: string[] = [];
    if (customPreset) {
      fromPresetJson = Object.keys(customPreset.config?.nodeTypes ?? {});
    }
    return Array.from(new Set([...builtIn, ...fromAppearances, ...fromNodes, ...fromPresetJson]));
  }, [nodeTypeAppearances, nodes, customPreset]);

  const nodeTypeLabels: Record<string, string> = useMemo(() => {
    const labels: Record<string, string> = {};
    nodeTypeKeys.forEach(
      (key) => (labels[key] = NODE_TYPE_LABELS[key] || key)
    );
    return labels;
  }, [nodeTypeKeys]);

  const [selectedNodeType, setSelectedNodeType] = useState<string>("");
  useEffect(() => {
    if (!selectedNodeType || !nodeTypeKeys.includes(selectedNodeType)) {
      setSelectedNodeType(nodeTypeKeys[0] || "");
    }
  }, [selectedNodeType, nodeTypeKeys]);

  const selectedNodeTypeAppearance = useMemo(
    () => nodeTypeAppearances?.[selectedNodeType] || {},
    [nodeTypeAppearances, selectedNodeType]
  );
  
  // --- Edge Type Logic ---
  const edgeTypeKeys = useMemo(
    () => Array.from(new Set(edges.map((e) => e.type || "default"))).sort(),
    [edges]
  );
  const [selectedEdgeType, setSelectedEdgeType] = useState<string>("");
   useEffect(() => {
    if (!selectedEdgeType || !edgeTypeKeys.includes(selectedEdgeType)) {
      setSelectedEdgeType(edgeTypeKeys[0] || "");
    }
  }, [selectedEdgeType, edgeTypeKeys]);


  // --- Preset Logic ---
  const completePresetObject = useMemo(() => {
    const typeKeys = [
      ...new Set([
        ...Object.keys(NODE_TYPE_LABELS),
        ...Object.keys(nodeTypeAppearances ?? {}),
      ]),
    ];
    const result: Record<string, any> = {};
    for (const type of typeKeys) {
      const config = nodeTypeAppearances?.[type] || {};
      result[type] = { ...DEFAULTS, icon: config.icon ?? type, ...config };
    }
    return {
        nodeTypes: result,
        edgeTypes: edgeTypeAppearances ?? {}
    };
  }, [nodeTypeAppearances, edgeTypeAppearances]);

  const displayedPresets = useMemo(() => {
    const presets = [...appearancePresets];
    if (customPreset) return [customPreset, ...presets];
    return presets;
  }, [customPreset]);

  useEffect(() => {
    if (selectedPresetKey === undefined) {
      const persistedKey = getPersistedSelectedPresetKey();
      const hasPersisted =
        persistedKey && displayedPresets.find((p) => p.key === persistedKey);
      if (hasPersisted) setSelectedPresetKey(persistedKey);
      else if (displayedPresets.length > 0) {
        setSelectedPresetKey(displayedPresets[0].key);
        persistSelectedPresetKey(displayedPresets[0].key);
      }
    } else {
      const found = displayedPresets.find((p) => p.key === selectedPresetKey);
      if (!found && displayedPresets.length > 0) {
        setSelectedPresetKey(displayedPresets[0].key);
        persistSelectedPresetKey(displayedPresets[0].key);
      }
    }
    // eslint-disable-next-line
  }, [displayedPresets]);

  useEffect(() => {
    if (
      selectedPresetKey &&
      displayedPresets.some((p) => p.key === selectedPresetKey)
    ) {
      persistSelectedPresetKey(selectedPresetKey);
    }
  }, [selectedPresetKey, displayedPresets]);

  const selectedPresetObj = useMemo(() => {
    if (!selectedPresetKey) return null;
    return displayedPresets.find((p) => p.key === selectedPresetKey) || null;
  }, [selectedPresetKey, displayedPresets]);

  const updateAllNodeAppearances = useCallback(
    (appearanceMap: Record<string, any>) => {
      setNodes(
        nodes.map((n) => ({
          ...n,
          appearance: appearanceMap[n.type]
            ? { ...appearanceMap[n.type] }
            : {},
        }))
      );
    },
    [nodes, setNodes]
  );

  const handlePresetSaveFromJson = useCallback(
    (jsonStr: string, onDone?: () => void) => {
      try {
        const data = JSON.parse(jsonStr);
        let nodeTypes = data.nodeTypes || {};
        let edgeTypes = data.edgeTypes || {};
        if (!data.nodeTypes && !data.edgeTypes) {
          nodeTypes = data;
          edgeTypes = {};
        }
        if (typeof nodeTypes !== "object" || typeof edgeTypes !== "object")
          throw new Error();
        Object.entries(nodeTypes).forEach(([type, config]) => {
          setNodeTypeAppearance(type, config as NodeTypeAppearance);
        });
        Object.entries(edgeTypes).forEach(([type, config]) => {
          setEdgeTypeAppearance(type, config as EdgeTypeAppearance);
        });
        const newPresetConfig = { nodeTypes, edgeTypes };
        persistCustomPreset(newPresetConfig);
        setCustomPreset({
          name: "Custom",
          key: CUSTOM_PRESET_KEY,
          config: newPresetConfig,
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
    },
    [setNodeTypeAppearance, setEdgeTypeAppearance, setCustomPreset, updateAllNodeAppearances]
  );

  const handlePresetSelect = useCallback(
    (
      presetConfig: PresetConfig,
      presetKey: string,
      onDone?: (nodeTypes: any, edgeTypes: any) => void
    ) => {
      let nodeTypes = presetConfig.nodeTypes || {};
      let edgeTypes = presetConfig.edgeTypes || {};
      
      Object.keys(useGraphStore.getState().nodeTypeAppearances).forEach(type => resetNodeTypeAppearance(type));
      Object.keys(useGraphStore.getState().edgeTypeAppearances).forEach(type => resetEdgeTypeAppearance(type));

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
    [setNodeTypeAppearance, setEdgeTypeAppearance, updateAllNodeAppearances, resetNodeTypeAppearance, resetEdgeTypeAppearance]
  );

  const updateAndSavePreset = useCallback(() => {
    const presetToSave = {
        nodeTypes: completePresetObject.nodeTypes,
        edgeTypes: completePresetObject.edgeTypes,
    };
    const success = handlePresetSaveFromJson(JSON.stringify(presetToSave, null, 2));
    if (success) {
      toast.success(`Appearance saved to custom preset.`);
    }
  }, [completePresetObject, handlePresetSaveFromJson]);

  const updateNodeTypeAppearance = useCallback((type: string, appearance: NodeTypeAppearance) => {
    setNodeTypeAppearance(type, appearance);
    updateAndSavePreset();
  }, [setNodeTypeAppearance, updateAndSavePreset]);

  const updateEdgeTypeAppearance = useCallback((type: string, appearance: EdgeTypeAppearance) => {
    setEdgeTypeAppearance(type, appearance);
    updateAndSavePreset();
  }, [setEdgeTypeAppearance, updateAndSavePreset]);

  useEffect(() => {
    const loaded = getPersistedCustomPreset();
    if (loaded) setCustomPreset(loaded);
  }, []);

  return {
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
    setSelectedPresetKey,
    selectedPresetObj,
    handlePresetSaveFromJson,
    handlePresetSelect,
  };
}
