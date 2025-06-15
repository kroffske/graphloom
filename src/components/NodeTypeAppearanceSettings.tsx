
import React from "react";
import NodeTypeAppearanceForm from "./NodeTypeAppearanceForm";

type NodeTypeAppearanceSettingsProps = {
  onSaveCustomPresetFromJson?: () => void;
};

export default function NodeTypeAppearanceSettings({ onSaveCustomPresetFromJson }: NodeTypeAppearanceSettingsProps) {
  return <NodeTypeAppearanceForm onSaveCustomPresetFromJson={onSaveCustomPresetFromJson} />;
}
