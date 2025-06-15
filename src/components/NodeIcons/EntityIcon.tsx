
import React from "react";

const EntityIcon = ({ filled = false, className = "", ...props }: { filled?: boolean; className?: string; "aria-label"?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Entity"
    className={className}
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
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
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
    />
  </svg>
);

export default EntityIcon;
