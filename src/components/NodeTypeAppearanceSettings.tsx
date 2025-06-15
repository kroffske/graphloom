
import React from "react";
import NodeTypeAppearanceForm from "./NodeTypeAppearanceForm";

type NodeTypeAppearanceSettingsProps = {
  onSave?: (type: string, appearance: object) => void;
};

export default function NodeTypeAppearanceSettings({ onSave }: NodeTypeAppearanceSettingsProps) {
  return <NodeTypeAppearanceForm onSave={onSave} />;
}
