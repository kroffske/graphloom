
import React, { useState } from "react";
import { useGraphStore } from "@/state/useGraphStore";
import { useIconRegistry } from "./IconRegistry";
import NodeSettingsForm from "./NodeSettingsForm";
import InspectorPanelTabs from "./InspectorPanelTabs";
import EdgeSettingsForm from "./EdgeSettingsForm";
import EdgeDetailsDisplay from "./EdgeDetailsDisplay";
import EdgeTypeAppearanceSettings from "./EdgeTypeAppearanceSettings";

const InspectorPanel = () => {
  const {
    selectedNodeId,
    selectedEdgeId,
    nodes,
    edges,
  } = useGraphStore();
  const iconRegistry = useIconRegistry();
  // The tab state will apply for whichever object is selected
  const [tab, setTab] = useState<"details" | "settings" | "type-settings">("details");

  // Show: nothing selected
  if (!selectedNodeId && !selectedEdgeId)
    return (
      <aside className="h-full w-72 p-6 border-l border-border bg-card rounded-r-lg shadow-md flex flex-col justify-center items-center">
        <span className="text-muted-foreground">Select a node or edge to see details</span>
      </aside>
    );

  // Node selected
  if (selectedNodeId) {
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;
    const Icon =
      iconRegistry[node.appearance?.icon || node.type] ||
      iconRegistry[node.type];

    return (
      <aside className="h-full w-80 p-6 border-l border-border bg-card rounded-r-lg shadow-md flex flex-col gap-4 animate-fade-in transition-all duration-300 overflow-y-auto">
        <div>
          <InspectorPanelTabs value={tab} onChange={setTab} extraTabs={[]} />
        </div>
        {tab === "details" && (
          <>
            <div className="flex items-center gap-3 mb-2">
              {Icon && (
                <Icon filled className="w-8 h-8" aria-label={node.type} />
              )}
              <span className="font-bold text-xl">{node.label}</span>
            </div>
            <div>
              <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">Attributes</div>
              <dl className="grid grid-cols-2 gap-x-2 gap-y-1">
                {Object.entries(node.attributes).map(([k, v]) => (
                  <React.Fragment key={k}>
                    <dt className="font-semibold text-xs text-muted-foreground">{k}</dt>
                    <dd className="text-xs text-foreground truncate">{String(v)}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </div>
          </>
        )}
        {tab === "settings" && (
          <div className="flex flex-col">
            <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">
              Node Settings
            </div>
            <NodeSettingsForm node={node} />
          </div>
        )}
      </aside>
    );
  }

  // Edge selected
  if (selectedEdgeId) {
    const edge = edges.find((e) => e.id === selectedEdgeId);
    if (!edge) return null;

    return (
      <aside className="h-full w-80 p-6 border-l border-border bg-card rounded-r-lg shadow-md flex flex-col gap-4 animate-fade-in transition-all duration-300 overflow-y-auto">
        <div>
          <InspectorPanelTabs
            value={tab}
            onChange={setTab}
            extraTabs={[
              {
                key: "type-settings",
                label: "Type Settings",
              },
            ]}
          />
        </div>
        {tab === "details" && (
          <div>
            <span className="font-bold text-base">Edge Details</span>
            <EdgeDetailsDisplay edge={edge} />
          </div>
        )}
        {tab === "settings" && (
          <div className="flex flex-col">
            <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">
              Edge Settings
            </div>
            <EdgeSettingsForm edge={edge} />
          </div>
        )}
        {tab === "type-settings" && (
          <div className="flex flex-col">
            <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">
              Edge Type Appearance Settings
            </div>
            <EdgeTypeAppearanceSettings />
          </div>
        )}
      </aside>
    );
  }

  // Fallback
  return null;
};

export default InspectorPanel;
