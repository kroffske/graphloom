
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

  // Show merged details: edge appearance overrides > type default > code default
  const color = appearance.color || typeAppearance.color || "#64748b";
  const width = appearance.width || typeAppearance.width || 2;

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
    <div className="flex flex-col gap-3">
      <div>
        <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">
          Edge Info
        </div>
        <dl className="grid grid-cols-2 gap-x-2 gap-y-1">
          <dt className="font-semibold text-xs text-muted-foreground">ID</dt>
          <dd className="text-xs text-foreground truncate">{edge.id}</dd>
          <dt className="font-semibold text-xs text-muted-foreground">Source</dt>
          <dd className="text-xs text-foreground truncate">{edge.source}</dd>
          <dt className="font-semibold text-xs text-muted-foreground">Target</dt>
          <dd className="text-xs text-foreground truncate">{edge.target}</dd>
          {label && (
            <>
              <dt className="font-semibold text-xs text-muted-foreground">Label</dt>
              <dd className="text-xs text-foreground truncate">{label}</dd>
            </>
          )}
        </dl>
      </div>
      {/* Edge attributes */}
      {edge.attributes && Object.keys(edge.attributes).length > 0 && (
        <div>
          <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">Attributes</div>
          <dl className="grid grid-cols-2 gap-x-2 gap-y-1">
            {Object.entries(edge.attributes).map(([k, v]) => (
              <React.Fragment key={k}>
                <dt className="font-semibold text-xs text-muted-foreground">{k}</dt>
                <dd className="text-xs text-foreground truncate">{String(v)}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
      )}
      {/* Appearance details */}
      <div>
        <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">
          Appearance (Effective)
        </div>
        <dl className="grid grid-cols-2 gap-x-2 gap-y-1">
          <dt className="font-semibold text-xs text-muted-foreground">Type</dt>
          <dd className="text-xs text-foreground">{edge.type || "default"}</dd>
          <dt className="font-semibold text-xs text-muted-foreground">Color</dt>
          <dd className="text-xs text-foreground">
            <span className="inline-block w-4 h-4 mr-1 rounded-full align-middle" style={{ background: color }} />
            {color}
          </dd>
          <dt className="font-semibold text-xs text-muted-foreground">Width</dt>
          <dd className="text-xs text-foreground">{width}px</dd>
        </dl>
      </div>
    </div>
  );
}
