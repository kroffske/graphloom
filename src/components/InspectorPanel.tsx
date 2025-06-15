
import React, { useState } from "react";
import { useGraphStore } from "@/state/useGraphStore";
import { useIconRegistry } from "./IconRegistry";
import NodeSettingsForm from "./NodeSettingsForm";
import InspectorPanelTabs from "./InspectorPanelTabs";

const InspectorPanel = () => {
  const { selectedNodeId, nodes } = useGraphStore();
  const iconRegistry = useIconRegistry();
  const [tab, setTab] = useState<"details" | "settings">("details");

  if (!selectedNodeId)
    return (
      <aside className="h-full w-72 p-6 border-l border-border bg-card rounded-r-lg shadow-md flex flex-col justify-center items-center">
        <span className="text-muted-foreground">Select a node to see details</span>
      </aside>
    );

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;
  const Icon = iconRegistry[node.appearance?.icon || node.type] || iconRegistry[node.type];

  return (
    <aside className="h-full w-80 p-6 border-l border-border bg-card rounded-r-lg shadow-md flex flex-col gap-4 animate-fade-in transition-all duration-300 overflow-y-auto">
      <div>
        <InspectorPanelTabs value={tab} onChange={setTab} />
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
};

export default InspectorPanel;
