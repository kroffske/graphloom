
import React from "react";

type DataStoreIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const DataStoreIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: DataStoreIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Data Store"
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
    <ellipse cx={12} cy={7} rx={8} ry={3} fill={filled ? (color || "currentColor") : "none"} />
    <rect x={4} y={7} width={16} height={10} fill={filled ? (color || "currentColor") : "none"} />
    <ellipse cx={12} cy={17} rx={8} ry={3} stroke={color || "currentColor"} />
  </svg>
);

export default DataStoreIcon;
