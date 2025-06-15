
import React from "react";

type WarehouseIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const WarehouseIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: WarehouseIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Warehouse"
    className={className}
    width={24}
    height={24}
    fill={filled ? (color || "currentColor") : "none"}
    stroke={color || "currentColor"}
    strokeWidth={2}
    strokeLinejoin="round"
    strokeLinecap="round"
    {...props}
  >
    <path d="M21 8.35V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.35" />
    <path d="M3.5 8.5L12 3l8.5 5.5" />
    <path d="M16 11h-3v5h3" />
    <path d="M13 11v5" />
  </svg>
);

export default WarehouseIcon;
