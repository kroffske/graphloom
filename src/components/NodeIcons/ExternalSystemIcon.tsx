
import React from "react";

const ExternalSystemIcon = ({ filled = false, className = "", ...props }: { filled?: boolean; className?: string; "aria-label"?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="External System"
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
    <ellipse cx={12} cy={16} rx={8} ry={3} fill={filled ? "currentColor" : "none"} />
    <path d="M4 16V8a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8" />
    <path d="M18.5 12l2.5 2v-4z" />
    <path d="M12 8V4" />
    <path d="M8 4h8" />
  </svg>
);

export default ExternalSystemIcon;
