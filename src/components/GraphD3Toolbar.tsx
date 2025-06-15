
import React from "react";
import { Button } from "@/components/ui/button";

type GraphD3ToolbarProps = {
  layoutMode: "force" | "circle" | "hierarchy" | "manual";
  setLayoutMode: (mode: "force" | "circle" | "hierarchy" | "manual") => void;
  onShowAllHidden: () => void;
};

const GraphD3Toolbar: React.FC<GraphD3ToolbarProps> = ({
  layoutMode,
  setLayoutMode,
  onShowAllHidden,
}) => (
  <div className="flex gap-3 items-center px-3 py-1 absolute z-10 bg-muted left-2 top-2 rounded shadow">
    <Button
      size="sm"
      variant={layoutMode === "force" ? "default" : "outline"}
      onClick={() => setLayoutMode("force")}
    >
      Force
    </Button>
    <Button
      size="sm"
      variant={layoutMode === "circle" ? "default" : "outline"}
      onClick={() => setLayoutMode("circle")}
    >
      Circle
    </Button>
    <Button
      size="sm"
      variant={layoutMode === "hierarchy" ? "default" : "outline"}
      onClick={() => setLayoutMode("hierarchy")}
    >
      Hierarchy
    </Button>
    <Button
      size="sm"
      variant={layoutMode === "manual" ? "default" : "outline"}
      onClick={() => setLayoutMode("manual")}
    >
      Manual
    </Button>
    <Button size="sm" onClick={onShowAllHidden}>
      Show All Hidden
    </Button>
  </div>
);

export default GraphD3Toolbar;
