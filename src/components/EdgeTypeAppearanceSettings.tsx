
import React, { useState } from "react";
import { useGraphStore } from "@/state/useGraphStore";
import EdgeTypeAppearanceForm from "./EdgeTypeAppearanceForm";
import { Separator } from "@/components/ui/separator";

export default function EdgeTypeAppearanceSettings() {
  const { edges } = useGraphStore();
  // Get all unique edge types
  const types = Array.from(new Set(edges.map(e => e.type || "default"))).sort();
  const [selected, setSelected] = useState<string>(types[0] || "default");

  if (!types.length) {
    return <div className="text-xs text-muted-foreground">No edges loaded.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 mb-2">
        {types.map(type => (
          <button
            className={`px-2 py-1 rounded text-xs border ${selected === type ? "bg-primary/20 border-primary text-primary font-bold" : "border-border"}`}
            onClick={() => setSelected(type)}
            key={type}
            type="button"
          >
            {type}
          </button>
        ))}
      </div>
      <EdgeTypeAppearanceForm type={selected} />
      <Separator className="my-3" />
      <span className="text-xs text-muted-foreground block">Changes will affect all edges of that type, unless individually overridden.</span>
    </div>
  );
}
