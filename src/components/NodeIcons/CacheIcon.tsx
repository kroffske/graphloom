
import React from "react";

type CacheIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const CacheIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: CacheIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Cache"
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
    <ellipse cx="12" cy="6" rx="8" ry="3" />
    <path d="M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
    <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
  </svg>
);

export default CacheIcon;
