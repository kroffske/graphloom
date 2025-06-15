
import React from "react";

type EntityIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const EntityIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: EntityIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Entity"
    className={className}
    width={24}
    height={24}
    fill="none"
    stroke={color || "currentColor"}
    strokeWidth={2}
    strokeLinejoin="round"
    strokeLinecap="round"
    {...props}
  >
    <rect
      x={4}
      y={4}
      width={16}
      height={16}
      rx={4}
      fill={filled ? (color || "currentColor") : "none"}
      stroke={color || "currentColor"}
    />
  </svg>
);

export default EntityIcon;
