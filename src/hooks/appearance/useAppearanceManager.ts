
import { useCallback, useMemo, useEffect, useState } from "react";
import { toast } from "sonner";
import { useGraphStore } from "@/state/useGraphStore";
import {
  NodeTypeAppearance,
  EdgeTypeAppearance,
  PresetConfig,
} from "@/types/appearance";
import {
  useAppearancePresets,
  persistCustomPreset,
  persistSelectedPresetKey,
} from "./useAppearancePresets";

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

  const {
    customPreset,
    setCustomPreset,
    displayedPresets,
    selectedPresetKey,
    setSelectedPresetKey,
    selectedPresetObj,
  } = useAppearancePresets();

  const [isPresetDirty, setIsPresetDirty] = useState(false);

  // --- Node Type Logic ---
  const nodeTypeKeys = useMemo(() => {
    const builtIn = Object.keys(NODE_TYPE_LABELS);
    const fromAppearances = Object.keys(nodeTypeAppearances ?? {});
    const fromNodes = nodes.map((n) => n.type);
    let fromPresetJson: string[] = [];
    if (customPreset) {
      fromPresetJson = Object.keys(customPreset.config?.nodeTypes ?? {});
    }
    return Array.from(
      new Set([...builtIn, ...fromAppearances, ...fromNodes, ...fromPresetJson])
    );
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
      edgeTypes: edgeTypeAppearances ?? {},
    };
  }, [nodeTypeAppearances, edgeTypeAppearances]);

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
    (jsonStr: string, onDone?: () => void, showToast = true) => {
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
        if (showToast) toast.success("Preset changes saved to 'Custom' preset!");
        if (onDone) onDone();
        setSelectedPresetKey(CUSTOM_PRESET_KEY);
        persistSelectedPresetKey(CUSTOM_PRESET_KEY);
        setIsPresetDirty(false); // Clear dirty state on save
        return true;
      } catch {
        toast.error("Invalid JSON format or content.");
        return false;
      }
    },
    [
      setNodeTypeAppearance,
      setEdgeTypeAppearance,
      setCustomPreset,
      updateAllNodeAppearances,
      setSelectedPresetKey,
    ]
  );

  const handlePresetSelect = useCallback(
    (presetConfig: PresetConfig, presetKey: string) => {
      let nodeTypes = presetConfig.nodeTypes || {};
      let edgeTypes = presetConfig.edgeTypes || {};

      Object.keys(useGraphStore.getState().nodeTypeAppearances).forEach(
        (type) => resetNodeTypeAppearance(type)
      );
      Object.keys(useGraphStore.getState().edgeTypeAppearances).forEach(
        (type) => resetEdgeTypeAppearance(type)
      );

      Object.entries(nodeTypes).forEach(([type, config]) => {
        setNodeTypeAppearance(type, config);
      });
      Object.entries(edgeTypes).forEach(([type, config]) => {
        setEdgeTypeAppearance(type, config as any);
      });
      updateAllNodeAppearances(nodeTypes);
      const preset = displayedPresets.find(p => p.key === presetKey);
      toast.success(`Preset "${preset?.name ?? presetKey}" loaded!`);
      setSelectedPresetKey(presetKey);
      persistSelectedPresetKey(presetKey);
      setIsPresetDirty(false);
    },
    [
      setNodeTypeAppearance,
      setEdgeTypeAppearance,
      updateAllNodeAppearances,
      resetNodeTypeAppearance,
      resetEdgeTypeAppearance,
      setSelectedPresetKey,
      displayedPresets,
    ]
  );
  
  const savePresetChanges = useCallback(() => {
    const presetToSave = {
        nodeTypes: completePresetObject.nodeTypes,
        edgeTypes: completePresetObject.edgeTypes,
    };
    handlePresetSaveFromJson(JSON.stringify(presetToSave, null, 2));
  }, [completePresetObject, handlePresetSaveFromJson]);
  
  const revertPresetChanges = useCallback(() => {
    if (selectedPresetObj) {
      handlePresetSelect(selectedPresetObj.config, selectedPresetObj.key);
      toast.info("Changes have been reverted.");
    }
  }, [selectedPresetObj, handlePresetSelect]);

  const updateNodeTypeAppearance = useCallback((type: string, appearance: NodeTypeAppearance) => {
    setNodeTypeAppearance(type, appearance);
    setIsPresetDirty(true);
  }, [setNodeTypeAppearance]);

  const updateEdgeTypeAppearance = useCallback((type: string, appearance: EdgeTypeAppearance) => {
    setEdgeTypeAppearance(type, appearance);
    setIsPresetDirty(true);
  }, [setEdgeTypeAppearance]);

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
    selectedPresetObj,
    handlePresetSaveFromJson,
    handlePresetSelect,
    isPresetDirty,
    setIsPresetDirty,
    savePresetChanges,
    revertPresetChanges,
  };
}
