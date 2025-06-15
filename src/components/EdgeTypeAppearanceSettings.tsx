
import React, { useState, useEffect } from "react";
import { useGraphStore } from "@/state/useGraphStore";
import EdgeTypeAppearanceForm from "./EdgeTypeAppearanceForm";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function EdgeTypeAppearanceSettings() {
  const { edges, selectedEdgeId } = useGraphStore();
  // Get all unique edge types
  const types = Array.from(new Set(edges.map(e => e.type || "default"))).sort();

  // Determine selectedEdgeType from selectedEdgeId if available
  const selectedEdge = selectedEdgeId
    ? edges.find(e => e.id === selectedEdgeId)
    : undefined;
  const selectedEdgeType = selectedEdge ? (selectedEdge.type || "default") : (types[0] || "default");
  // Use local state but initialize to selectedEdgeType
  const [selected, setSelected] = useState<string>(selectedEdgeType);

  // Update dropdown if edge selection changes
  useEffect(() => {
    if (selectedEdgeType && types.includes(selectedEdgeType)) {
      setSelected(selectedEdgeType);
    } else if (types.length > 0) {
      setSelected(types[0]);
    }
  }, [selectedEdgeType, types.join(",")]);

  if (!types.length) {
    return <div className="text-xs text-muted-foreground">No edges loaded.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-2 w-full max-w-xs">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-full h-8 text-xs">
            <SelectValue placeholder="Select edge type" />
          </SelectTrigger>
          <SelectContent>
            {types.map(type => (
              <SelectItem value={type} key={type} className="text-xs capitalize">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <EdgeTypeAppearanceForm type={selected} />
      <Separator className="my-3" />
      <span className="text-xs text-muted-foreground block">
        Changes will affect all edges of that type, unless individually overridden.
      </span>
    </div>
  );
}
