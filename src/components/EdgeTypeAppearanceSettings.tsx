
import React, { useState, useEffect } from "react";
import EdgeTypeAppearanceForm from "./EdgeTypeAppearanceForm";
import { useGraphStore } from "@/state/useGraphStore";
import { EdgeTypeAppearance } from "@/types/appearance";

type EdgeTypeAppearanceSettingsProps = {
  onSave: (type: string, appearance: EdgeTypeAppearance) => void;
  onReset: (type: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  allTypes: string[];
};

export default function EdgeTypeAppearanceSettings({
  onSave,
  onReset,
  selectedType,
  setSelectedType,
  allTypes,
}: EdgeTypeAppearanceSettingsProps) {
  const { edges, selectedEdgeId } = useGraphStore();

  // Determine selected type based on selected edge, fallback to first type
  const selectedEdge = selectedEdgeId
    ? edges.find((e) => e.id === selectedEdgeId)
    : undefined;
  const selectedEdgeType = selectedEdge
    ? selectedEdge.type || "default"
    : selectedType || allTypes[0] || "default";

  useEffect(() => {
    // Sync local selected type if the current selected type changes (e.g. new edge selected)
    if (selectedEdgeType && allTypes.includes(selectedEdgeType)) {
      setSelectedType(selectedEdgeType);
    } else if (allTypes.length > 0 && !allTypes.includes(selectedType)) {
      setSelectedType(allTypes[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEdgeType, allTypes.join(","), setSelectedType]);

  if (!allTypes.length) {
    return (
      <div className="text-xs text-muted-foreground">No edges loaded.</div>
    );
  }

  // Section shell, matching NodeTypeAppearanceForm
  return (
    <section className="w-full">
      <div className="font-semibold text-lg mb-2 flex items-center gap-2">
        Edge Type Appearance
      </div>
      <EdgeTypeAppearanceForm
        type={selectedType}
        allTypes={allTypes}
        onTypeChange={setSelectedType}
        onSave={onSave}
        onReset={onReset}
      />
      <p className="text-xs text-muted-foreground mt-2">
        These settings affect all edges of this type. You can still override
        them for individual edges.
      </p>
    </section>
  );
}
