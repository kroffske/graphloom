import React from "react";
import type { GraphNode } from "@/types/graph";
import { useIconRegistry } from "./IconRegistry";
import { useGraphStore } from "@/state/useGraphStore";
import { resolveLabelTemplate } from "@/utils/labelTemplate";
import { isEmoji } from "@/config/emojiIcons";

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
  const { nodeTypeAppearances } = useGraphStore();

  // Compute the final appearance
  // Use per-node appearance if set, else fall back to type appearance, else default
  const typeAppearance = nodeTypeAppearances?.[node.type] ?? {};
  const appearance = node.appearance && Object.keys(node.appearance).length > 0
    ? node.appearance
    : typeAppearance;

  // Appearance props
  const iconType = appearance.icon || node.type;
  const iconColor = appearance.iconColor || "#222";
  const borderColor = appearance.borderColor || "#e5e7eb";
  const borderEnabled = Boolean(appearance.borderEnabled);
  const nodeSize = appearance.size ?? 38;
  const labelTemplate = appearance.labelTemplate;
  const Icon = iconRegistry[iconType];

  // Usable background color (allow full RGBA / transparency)
  const backgroundColor =
    typeof appearance.backgroundColor === "string" && appearance.backgroundColor.length > 0
      ? appearance.backgroundColor
      : "transparent";

  // Border: Only show if enabled or if selected
  const baseBorderWidth = appearance.borderWidth ?? 2;
  const appliedBorderColor = borderEnabled || selected ? (selected ? "#3b82f6" : borderColor) : "transparent";
  const borderWidth = borderEnabled ? baseBorderWidth : (selected ? 2 : 0);

  // Label extraction
  const label = labelTemplate
    ? resolveLabelTemplate(labelTemplate, { ...node, ...node.attributes }, node.label)
    : node.label;

  // For layout: svg circle is nodeSize, keep icon slightly smaller
  const radius = nodeSize / 2;
  const iconSize = nodeSize * 0.54; // center in circle comfortably
  const iconClass = `select-none mx-auto ${iconSize ? `w-[${iconSize}px] h-[${iconSize}px]` : "w-8 h-8"}`;

  // Label sits just below the circle, not too far, and not overlapping
  // Container set to relative for proper stacking of circle/icon/label
  return (
    <div
      className="flex flex-col items-center cursor-pointer outline-none relative"
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
        minHeight: nodeSize, // allow label area
        background: "none", // No rect background
        position: "relative",
      }}
    >
      {/* Node as circular SVG background, center icon */}
      <div style={{ position: "relative", width: nodeSize, height: nodeSize }}>
        <svg width={nodeSize} height={nodeSize} style={{ display: "block" }}>
          <circle
            cx={radius}
            cy={radius}
            r={radius - borderWidth / 2}
            fill={backgroundColor}
            stroke={appliedBorderColor}
            strokeWidth={borderWidth}
          />
        </svg>
        {/* Center icon absolutely inside the circle */}
        <div
          style={{
            position: "absolute",
            width: nodeSize,
            height: nodeSize,
            top: 0,
            left: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
          className="select-none"
        >
          {iconType && (
            <>
              {isEmoji(iconType) ? (
                // Render emoji directly
                <span
                  className={iconClass}
                  style={{ 
                    color: iconColor,
                    fontSize: `${iconSize}px`,
                    lineHeight: 1,
                    userSelect: 'none'
                  }}
                  role="img"
                  aria-label={iconType}
                >
                  {iconType}
                </span>
              ) : Icon ? (
                // Render icon component
                <Icon
                  className={iconClass}
                  aria-label={iconType}
                  filled={true}
                  color={iconColor}
                />
              ) : (
                // Fallback text
                <span
                  className={iconClass}
                  style={{ 
                    color: iconColor,
                    fontSize: '14px',
                    userSelect: 'none'
                  }}
                >
                  {iconType}
                </span>
              )}
            </>
          )}
        </div>
        {/* Label inside the circle, centered */}
        <span
          className="text-xs font-medium truncate text-foreground text-center"
          style={{
            position: "absolute",
            width: nodeSize * 0.9,
            bottom: radius * 0.3, // Closer to center
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none', // to not interfere with clicks
            lineHeight: "1.1",
            maxHeight: "2.1em", // Allow up to 2 lines, but it will be truncated
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
          title={label}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export default GraphD3Node;

// Error fixed: removed 'style' prop from Icon component.
