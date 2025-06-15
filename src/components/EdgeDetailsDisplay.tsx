
import React from "react";
import { GraphEdge } from "@/state/useGraphStore";

type Props = {
  edge: GraphEdge;
};

export default function EdgeDetailsDisplay({ edge }: Props) {
  const appearance = edge.appearance || {};
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
          {edge.label && (
            <>
              <dt className="font-semibold text-xs text-muted-foreground">Label</dt>
              <dd className="text-xs text-foreground truncate">{edge.label}</dd>
            </>
          )}
        </dl>
      </div>
      {appearance && (
        <div>
          <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">
            Appearance
          </div>
          <dl className="grid grid-cols-2 gap-x-2 gap-y-1">
            <dt className="font-semibold text-xs text-muted-foreground">Color</dt>
            <dd className="text-xs text-foreground">
              <span className="inline-block w-4 h-4 mr-1 rounded-full align-middle" style={{ background: appearance.color || "#64748b" }} />
              {appearance.color || "-"}
            </dd>
            <dt className="font-semibold text-xs text-muted-foreground">Width</dt>
            <dd className="text-xs text-foreground">{appearance.width || 2}px</dd>
          </dl>
        </div>
      )}
    </div>
  );
}
