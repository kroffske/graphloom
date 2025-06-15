
import React from "react";

type ServerIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const ServerIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: ServerIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Server"
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
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" fill={filled ? (color || "currentColor") : "none"} />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" fill={filled ? (color || "currentColor") : "none"} />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
);

export default ServerIcon;
