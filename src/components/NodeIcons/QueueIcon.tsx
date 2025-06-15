
import React from "react";

type QueueIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const QueueIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: QueueIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Queue"
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
    <rect x="2" y="6" width="4" height="12" rx="1" />
    <rect x="7" y="6" width="4" height="12" rx="1" />
    <rect x="12" y="6" width="4" height="12" rx="1" />
    <rect x="17" y="6" width="4" height="12" rx="1" />
  </svg>
);

export default QueueIcon;
