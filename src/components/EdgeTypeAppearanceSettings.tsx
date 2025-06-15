import React, { useState, useEffect } from "react";
import { useGraphStore } from "@/state/useGraphStore";
import EdgeTypeAppearanceForm from "./EdgeTypeAppearanceForm";

// Accept onSaveCustomPresetFromJson for future extensibility like NodeTypeAppearanceSettings
type EdgeTypeAppearanceSettingsProps = {
  onSaveCustomPresetFromJson?: () => void;
};

export default function EdgeTypeAppearanceSettings({ onSaveCustomPresetFromJson }: EdgeTypeAppearanceSettingsProps) {
  const { edges, selectedEdgeId } = useGraphStore();
  // Get unique edge types
  const types = Array.from(new Set(edges.map(e => e.type || "default"))).sort();

  // Determine selected type based on selected edge, fallback to first type
  const selectedEdge = selectedEdgeId
    ? edges.find(e => e.id === selectedEdgeId)
    : undefined;
  const selectedEdgeType = selectedEdge ? (selectedEdge.type || "default") : (types[0] || "default");

  // Track the selected type; when list of types changes, keep in sync
  const [selected, setSelected] = useState<string>(selectedEdgeType);

  useEffect(() => {
    // Sync local selected type if the current selected type changes (e.g. new edge selected)
    if (selectedEdgeType && types.includes(selectedEdgeType)) {
      setSelected(selectedEdgeType);
    } else if (types.length > 0) {
      setSelected(types[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEdgeType, types.join(",")]);

  if (!types.length) {
    return <div className="text-xs text-muted-foreground">No edges loaded.</div>;
  }

  // Section shell, matching NodeTypeAppearanceForm
  return (
    <section className="w-full">
      <div className="font-semibold text-lg mb-2 flex items-center gap-2">
        Edge Type Appearance
      </div>
      <EdgeTypeAppearanceForm
        type={selected}
        allTypes={types}
        value={selected}
        onTypeChange={setSelected}
        onSaveCustomPresetFromJson={onSaveCustomPresetFromJson}
      />
      <p className="text-xs text-muted-foreground mt-2">
        These settings affect all edges of this type. You can still override them for individual edges.
      </p>
    </section>
  );
}
