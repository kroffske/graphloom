
import React from "react";
import NodeTypeAppearanceSettings from "@/components/NodeTypeAppearanceSettings";
import EdgeTypeAppearanceSettings from "@/components/EdgeTypeAppearanceSettings";

type Props = {
  onSaveCustomPresetFromJson: () => void;
};

export default function AppearanceSettingsColumns({ onSaveCustomPresetFromJson }: Props) {
  return (
    <div className="w-full flex flex-col md:flex-row gap-6 mt-2">
      <div className="w-full md:w-1/2 flex-shrink-0">
        <NodeTypeAppearanceSettings onSaveCustomPresetFromJson={onSaveCustomPresetFromJson} />
      </div>
      <div className="w-full md:w-1/2 flex flex-col min-w-[240px] max-w-[520px]">
        <div className="font-semibold text-base mb-1">Edge Type Appearance</div>
        <EdgeTypeAppearanceSettings onSaveCustomPresetFromJson={onSaveCustomPresetFromJson} />
      </div>
    </div>
  );
}
