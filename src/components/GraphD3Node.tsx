import React from "react";
import { GraphNode } from "@/state/useGraphStore";
import { useIconRegistry } from "./IconRegistry";

/**
 * Renders the node as a circular background (with optional transparency),
 * icon centered, and label below (unless "circle mode" disables label).
 * Removes all default border lines unless border is explicitly enabled.
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

  // Appearance props
  const iconType = appearance.icon || node.type;
  const iconColor = appearance.iconColor || "#222";
  const borderColor =
    typeof appearance.borderEnabled === "boolean" && !appearance.borderEnabled
      ? "transparent"
      : appearance.borderColor || "#e5e7eb";
  const borderEnabled = Boolean(appearance.borderEnabled);
  const nodeSize = appearance.size ?? 64;
  const labelField = appearance.labelField || "label";
  const Icon = iconRegistry[iconType];

  // Usable background color (allow full RGBA / transparency)
  const backgroundColor =
    typeof appearance.backgroundColor === "string" && appearance.backgroundColor.length > 0
      ? appearance.backgroundColor
      : "transparent";

  // Border: Only show if enabled or if selected
  const appliedBorderColor = borderEnabled || selected ? (selected ? "#3b82f6" : borderColor) : "transparent";
  const borderWidth = borderEnabled || selected ? 2 : 0;

  // Label extraction
  const label =
    labelField === "label"
      ? node.label
      : node.attributes[labelField] !== undefined
      ? String(node.attributes[labelField])
      : node.label;

  // For layout: svg circle is nodeSize, keep icon slightly smaller
  const radius = nodeSize / 2;
  const iconSize = nodeSize * 0.54; // center in circle comfortably

  return (
    <div
      className={`flex flex-col items-center cursor-pointer outline-none`}
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
        minHeight: nodeSize + 18,
        outline: "none",
        pointerEvents: "all",
        background: "none", // No rect background
      }}
    >
      {/* Node as circular SVG background, center icon */}
      <svg
        width={nodeSize}
        height={nodeSize}
        style={{ display: "block" }}
      >
        <circle
          cx={radius}
          cy={radius}
          r={radius - borderWidth / 2}
          fill={backgroundColor}
          stroke={appliedBorderColor}
          strokeWidth={borderWidth}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          width: nodeSize,
          height: nodeSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          top: 0,
          left: 0,
          pointerEvents: "none", // only SVG handles interaction
        }}
        className="select-none"
      >
        {Icon && (
          <Icon
            className="w-8 h-8"
            style={{
              width: iconSize,
              height: iconSize,
            }}
            aria-label={iconType}
            filled={true}
            color={iconColor}
          />
        )}
      </div>
      {/* Label below the circle, max width */}
      <span
        className="text-xs font-medium truncate max-w-[90px] text-foreground text-center mt-1"
        style={{
          width: nodeSize * 0.95,
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default GraphD3Node;
