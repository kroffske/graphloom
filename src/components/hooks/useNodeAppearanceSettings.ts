
import React from "react";
import { useGraphStore } from "@/state/useGraphStore";

/**
 * Hook to handle local node appearance editing/sync per type.
 * Handles syncing with graph state and preset JSON as found in original form.
 */
export function useNodeAppearanceSettings(selectedType: string, presetJsonString: string) {
  const {
    nodeTypeAppearances,
    setNodeTypeAppearance,
    resetNodeTypeAppearance,
    nodes,
  } = useGraphStore();

  // Calculate present node types
  const builtIn = ["entity", "process", "data-store", "event", "decision", "external-system"];
  const fromAppearances = Object.keys(nodeTypeAppearances ?? {});
  const fromNodes = nodes.map((n) => n.type);
  let fromPresetJson: string[] = [];
  if (presetJsonString) {
    try {
      const parsed = JSON.parse(presetJsonString);
      if (parsed && typeof parsed === "object") fromPresetJson = Object.keys(parsed);
    } catch { }
  }

  const nodeTypeKeys = React.useMemo(() =>
    Array.from(new Set([...builtIn, ...fromAppearances, ...fromNodes, ...fromPresetJson])),
    [nodeTypeAppearances, nodes, presetJsonString]
  );

  // Label mapping
  const FRIENDLY_TYPE_LABELS: Record<string, string> = {
    entity: "Entity",
    process: "Process",
    "data-store": "Data Store",
    event: "Event",
    decision: "Decision",
    "external-system": "External System",
  };
  const nodeTypeLabels: Record<string, string> = React.useMemo(() => {
    const labels: Record<string, string> = {};
    nodeTypeKeys.forEach(
      (key) => (labels[key] = FRIENDLY_TYPE_LABELS[key] || key)
    );
    return labels;
  }, [nodeTypeKeys]);

  // Expose appearance for type
  const appearance = nodeTypeAppearances?.[selectedType] || {};

  // . . . Any other logic can stay in form (provide helper if needed)

  return {
    nodeTypeKeys,
    nodeTypeLabels,
    appearance,
    setNodeTypeAppearance,
    resetNodeTypeAppearance,
  };
}
