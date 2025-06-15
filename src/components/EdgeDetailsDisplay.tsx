
import React from "react";
import { GraphEdge } from "@/state/useGraphStore";
import { useGraphStore } from "@/state/useGraphStore";

type Props = {
  edge: GraphEdge;
};

export default function EdgeDetailsDisplay({ edge }: Props) {
  const { edgeTypeAppearances } = useGraphStore();
  const appearance = edge.appearance || {};
  const typeAppearance = edgeTypeAppearances[edge.type || "default"] || {};

  // Show merged details: edge appearance overrides > type default > code default
  const color = appearance.color || typeAppearance.color || "#64748b";
  const width = appearance.width || typeAppearance.width || 2;

  // Compute label shown, considering override field
  const labelField = typeAppearance.labelField || "label";
  let label: string | undefined = appearance.label;
  if (!label && edge.attributes && labelField && labelField !== "label") {
    if (typeof edge.attributes[labelField] !== "undefined") {
      label = String(edge.attributes[labelField]);
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
          {(label || appearance.label) && (
            <>
              <dt className="font-semibold text-xs text-muted-foreground">Label</dt>
              <dd className="text-xs text-foreground truncate">{label ?? appearance.label}</dd>
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
