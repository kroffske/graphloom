
import React from "react";
import NodeTypeAppearanceForm from "./NodeTypeAppearanceForm";

// Add prop for saving custom preset
type NodeTypeAppearanceSettingsProps = {
  onSaveCustomPresetFromJson?: () => void;
};

export default function NodeTypeAppearanceSettings({ onSaveCustomPresetFromJson }: NodeTypeAppearanceSettingsProps) {
  return <NodeTypeAppearanceForm onSaveCustomPresetFromJson={onSaveCustomPresetFromJson} />;
}
