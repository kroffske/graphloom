
import React from "react";
import type { GraphEdge } from "@/types/graph";
import { useGraphStore } from "@/state/useGraphStore";
import { resolveLabelTemplate } from "@/utils/labelTemplate";

type Props = {
  edge: GraphEdge;
};

export default function EdgeDetailsDisplay({ edge }: Props) {
  const { edgeTypeAppearances, nodes } = useGraphStore();
  const appearance = edge.appearance || {};
  const typeAppearance = edgeTypeAppearances[edge.type || "default"] || {};

  // Compute label shown
  let label: string | undefined = appearance.label;
  if (label === undefined || label === "") {
    const template = appearance.labelTemplate || typeAppearance.labelTemplate;
    if (template) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      const context = {
        ...edge,
        ...edge.attributes,
        source_label: sourceNode?.label,
        target_label: targetNode?.label,
        source: sourceNode,
        target: targetNode,
      };
      label = resolveLabelTemplate(template, context, "");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Details</h4>
        <div className="space-y-1">
          {/* Core properties */}
          <div className="flex justify-between text-sm">
            <span className="font-medium text-muted-foreground select-text">id:</span>
            <span className="text-foreground truncate max-w-[60%] select-text cursor-text" title={edge.id}>{edge.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium text-muted-foreground select-text">source:</span>
            <span className="text-foreground truncate max-w-[60%] select-text cursor-text" title={edge.source}>{edge.source}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium text-muted-foreground select-text">target:</span>
            <span className="text-foreground truncate max-w-[60%] select-text cursor-text" title={edge.target}>{edge.target}</span>
          </div>
          {edge.type && (
            <div className="flex justify-between text-sm">
              <span className="font-medium text-muted-foreground select-text">type:</span>
              <span className="text-foreground truncate max-w-[60%] select-text cursor-text" title={edge.type}>{edge.type}</span>
            </div>
          )}
          {label && (
            <div className="flex justify-between text-sm">
              <span className="font-medium text-muted-foreground select-text">label:</span>
              <span className="text-foreground truncate max-w-[60%] select-text cursor-text" title={label}>{label}</span>
            </div>
          )}
          
          {/* Visual separator */}
          {edge.attributes && Object.keys(edge.attributes).length > 0 && <div className="my-2 border-t" />}
          
          {/* Custom attributes */}
          {edge.attributes && Object.entries(edge.attributes).map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="font-medium text-muted-foreground select-text">{k}:</span>
              <span className="text-foreground truncate max-w-[60%] select-text cursor-text" title={String(v)}>{String(v)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
