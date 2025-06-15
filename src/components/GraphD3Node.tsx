
import React from "react";
import { GraphNode } from "@/state/useGraphStore";
import { useIconRegistry } from "./IconRegistry";

/**
 * Renders the node box in a way visually consistent with the previous UI.
 * (Meant for rendering in a D3 foreignObject overlay.)
 */
const GraphD3Node = ({
  node,
  selected,
  onSelect,
}: {
  node: GraphNode;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) => {
  const iconRegistry = useIconRegistry();
  const Icon = iconRegistry[node.type];

  return (
    <div
      className={`flex flex-col items-center px-3 py-2 rounded-lg shadow-md cursor-pointer outline-none border-2 bg-white dark:bg-card transition-all duration-200 ${
        selected ? "border-primary ring-2 ring-blue-300" : "border-transparent"
      }`}
      tabIndex={0}
      role="button"
      aria-label={node.label || "Node"}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSelect?.(node.id);
        }
      }}
      onClick={() => onSelect?.(node.id)}
      style={{
        minWidth: 64,
        minHeight: 64,
        outline: "none",
        pointerEvents: "all",
        background: "var(--card)",
      }}
    >
      {Icon && (
        <Icon className="w-8 h-8 mb-1" aria-label={node.type} filled={false} />
      )}
      <span className="text-xs font-medium truncate max-w-[90px] text-foreground">
        {node.label}
      </span>
    </div>
  );
};

export default GraphD3Node;
