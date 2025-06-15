
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

  // New Appearance
  const showIconCircle = !!appearance.showIconCircle;
  const iconCircleColor = appearance.iconCircleColor || "#ededed";
  const backgroundColor = appearance.backgroundColor || nodeColor || "#fff";
  const borderColor = appearance.lineColor || "#b2bec6";

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
        background: showIconCircle ? "transparent" : backgroundColor,
        borderColor: borderColor,
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="flex items-center justify-center" style={{ marginBottom: 4 }}>
        {Icon &&
          (showIconCircle ? (
            <span
              className="flex items-center justify-center"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                backgroundColor: iconCircleColor,
                border: `2px solid ${borderColor}`,
                boxShadow: selected ? "0 0 0 2px #93c5fd" : undefined,
                marginRight: 0,
                marginLeft: 0,
                // Ensure all outside is transparent
                boxSizing: "border-box",
              }}
            >
              <Icon
                className="w-7 h-7 text-[#30334a]"
                aria-label={iconType}
                filled={true}
              />
            </span>
          ) : (
            <Icon
              className="w-8 h-8 text-[#30334a]"
              aria-label={iconType}
              filled={true}
            />
          ))}
      </div>
      <span className="text-xs font-medium truncate max-w-[90px] text-foreground text-center">
        {label}
      </span>
    </div>
  );
};

export default GraphD3Node;

