
import React from "react";

const ProcessIcon = ({ filled = false, className = "", ...props }: { filled?: boolean; className?: string; "aria-label"?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Process"
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
    <circle cx={12} cy={12} r={10} fill={filled ? "currentColor" : "none"} />
    <g>
      <path d="M12 8v4h4" />
      <circle cx={12} cy={12} r={4} stroke="currentColor" fill="none" />
    </g>
  </svg>
);

export default ProcessIcon;
