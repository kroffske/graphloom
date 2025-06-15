import React from "react";
import NodeTypeAppearanceForm from "./NodeTypeAppearanceForm";
import { NodeTypeAppearance } from "@/types/appearance";
import { NodeTypeAppearanceSettingsProps } from "@/types/forms";

export default function NodeTypeAppearanceSettings({
  onSave,
  onReset,
  selectedType,
  setSelectedType,
  appearance,
  nodeTypeKeys,
  nodeTypeLabels,
}: NodeTypeAppearanceSettingsProps) {
  return (
    <NodeTypeAppearanceForm
      onSave={onSave}
      onReset={onReset}
      selectedType={selectedType}
      setSelectedType={setSelectedType}
      appearance={appearance}
      nodeTypeKeys={nodeTypeKeys}
      nodeTypeLabels={nodeTypeLabels}
    />
  );
}
