
import React from "react";
import { useGraphStore } from "@/state/useGraphStore";
import { useIconRegistry } from "./IconRegistry";
import NodeSettingsForm from "./NodeSettingsForm";

const InspectorPanel = () => {
  const { selectedNodeId, nodes } = useGraphStore();
  const iconRegistry = useIconRegistry();

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
      <div className="flex items-center gap-3">
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
      <div className="pt-2 border-t border-border">
        <div className="text-xs uppercase font-semibold text-muted-foreground mb-2 mt-2">
          Edit Node
        </div>
        <NodeSettingsForm node={node} />
      </div>
    </aside>
  );
};

export default InspectorPanel;
