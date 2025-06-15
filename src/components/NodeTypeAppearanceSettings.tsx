
import React from "react";
import NodeTypeAppearanceForm from "./NodeTypeAppearanceForm";
import { NodeTypeAppearance } from "@/types/appearance";

type NodeTypeAppearanceSettingsProps = {
  onSave: (type: string, appearance: NodeTypeAppearance) => void;
  onReset: (type: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  appearance: NodeTypeAppearance;
  nodeTypeKeys: string[];
  nodeTypeLabels: Record<string, string>;
};

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
