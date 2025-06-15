
import React from "react";
import NodeTypeAppearanceSettings from "@/components/NodeTypeAppearanceSettings";
import EdgeTypeAppearanceSettings from "@/components/EdgeTypeAppearanceSettings";
import { useAppearanceManager } from "@/hooks/appearance/useAppearanceManager";

export default function AppearanceSettingsColumns() {
  const {
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
  } = useAppearanceManager();

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 mt-2 flex-1">
      <div className="w-full md:w-1/2 flex-shrink-0 bg-card shadow rounded-lg p-5">
        <div className="font-semibold text-base mb-1">Node Type Appearance</div>
        <NodeTypeAppearanceSettings
          onSave={updateNodeTypeAppearance}
          onReset={resetNodeTypeAppearance}
          selectedType={selectedNodeType}
          setSelectedType={setSelectedNodeType}
          appearance={selectedNodeTypeAppearance}
          nodeTypeKeys={nodeTypeKeys}
          nodeTypeLabels={nodeTypeLabels}
        />
      </div>
      <div className="w-full md:w-1/2 flex-shrink-0 bg-card shadow rounded-lg p-5">
        <div className="font-semibold text-base mb-1">Edge Type Appearance</div>
        <EdgeTypeAppearanceSettings
          onSave={updateEdgeTypeAppearance}
          onReset={resetEdgeTypeAppearance}
          selectedType={selectedEdgeType}
          setSelectedType={setSelectedEdgeType}
          allTypes={edgeTypeKeys}
        />
      </div>
    </div>
  );
}
