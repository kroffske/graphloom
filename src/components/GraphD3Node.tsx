

import React from "react";
import { GraphNode } from "@/state/useGraphStore";
import { useIconRegistry } from "./IconRegistry";

/**
 * Renders the node box in a way visually consistent with the previous UI.
 * (Meant for rendering in a D3 foreignObject overlay and obeys .appearance.)
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
  // Appearance values (fallbacks for legacy data):
  const appearance = node.appearance || {};
  const iconType = appearance.icon || node.type;
  const nodeColor =
    appearance.color ||
    (typeof node.attributes.color === "string" ? node.attributes.color : undefined) ||
    "var(--card)";
  const nodeSize = appearance.size ?? 64;
  const labelField = appearance.labelField || "label";
  const Icon = iconRegistry[iconType];

  const label =
    labelField === "label"
      ? node.label
      : node.attributes[labelField] !== undefined
      ? String(node.attributes[labelField])
      : node.label;

  return (
    <div
      className={`flex flex-col items-center px-3 py-2 rounded-lg shadow-md cursor-pointer outline-none border-2 transition-all duration-200
      ${selected ? "border-primary ring-2 ring-blue-300" : "border-transparent"}
      `}
      tabIndex={0}
      role="button"
      aria-label={label || "Node"}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSelect?.(node.id);
        }
      }}
      onClick={() => onSelect?.(node.id)}
      style={{
        minWidth: nodeSize,
        minHeight: nodeSize,
        outline: "none",
        pointerEvents: "all",
        background: nodeColor,
        // border color from Tailwind class above
      }}
    >
      {Icon && (
        <Icon
          className="w-8 h-8 mb-1"
          aria-label={iconType}
          filled={false}
        />
      )}
      <span className="text-xs font-medium truncate max-w-[90px] text-foreground">
        {label}
      </span>
    </div>
  );
};

export default GraphD3Node;

