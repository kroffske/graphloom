
import React from "react";
import { Button } from "@/components/ui/button";

type GraphD3ToolbarProps = {
  layoutMode: "simulation" | "manual";
  setLayoutMode: (mode: "simulation" | "manual") => void;
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
      variant={layoutMode === "simulation" ? "default" : "outline"}
      onClick={() => setLayoutMode("simulation")}
    >
      Layout Mode
    </Button>
    <Button
      size="sm"
      variant={layoutMode === "manual" ? "default" : "outline"}
      onClick={() => setLayoutMode("manual")}
    >
      Manual Mode
    </Button>
    <Button size="sm" onClick={onShowAllHidden}>
      Show All Hidden
    </Button>
  </div>
);

export default GraphD3Toolbar;
