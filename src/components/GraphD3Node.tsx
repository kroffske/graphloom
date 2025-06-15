
import React from "react";
import { GraphNode } from "@/state/useGraphStore";
import { useIconRegistry } from "./IconRegistry";

/**
 * Renders the node box in a way visually consistent with the previous UI, or as a minimal icon+label in circle mode.
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
  const appearance = node.appearance || {};
  const iconType = appearance.icon || node.type;

  // New pattern for icon color and border
  const iconColor = appearance.iconColor || "#222";
  const borderColor = appearance.borderEnabled ? (appearance.borderColor || "#e5e7eb") : "transparent";
  const nodeSize = appearance.size ?? 64;
  const labelField = appearance.labelField || "label";
  const Icon = iconRegistry[iconType];

  // Main node box background: only use appearance.backgroundColor (not nodeColor!)
  const backgroundColor = appearance.backgroundColor || "transparent";

  // Border logic
  // Selected node border takes precedence
  const appliedBorderColor = selected ? "#3b82f6" : borderColor;

  const label =
    labelField === "label"
      ? node.label
      : node.attributes[labelField] !== undefined
      ? String(node.attributes[labelField])
      : node.label;

  return (
    <div
      className={`flex flex-col items-center px-3 py-2 rounded-lg shadow-md cursor-pointer outline-none border-2
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
        background: backgroundColor,
        borderColor: appliedBorderColor,
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="flex items-center justify-center" style={{ marginBottom: 4 }}>
        {Icon && (
          <Icon
            className="w-8 h-8"
            aria-label={iconType}
            filled={true}
            color={iconColor}
          />
        )}
      </div>
      <span className="text-xs font-medium truncate max-w-[90px] text-foreground text-center">
        {label}
      </span>
    </div>
  );
};

export default GraphD3Node;
