
import React from "react";

type MonitorIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const MonitorIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: MonitorIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Monitor"
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
    <rect x="2" y="3" width="20" height="14" rx="2" fill={filled ? (color || "currentColor") : "none"}/>
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 12h2l2-4 2 4h2" />
  </svg>
);

export default MonitorIcon;
