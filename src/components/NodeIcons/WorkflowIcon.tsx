
import React from "react";

type WorkflowIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const WorkflowIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: WorkflowIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Workflow"
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
    <rect x="3" y="3" width="6" height="6" rx="1" fill={filled ? (color || "currentColor") : "none"} />
    <rect x="15" y="15" width="6" height="6" rx="1" fill={filled ? (color || "currentColor") : "none"} />
    <path d="M9 6h4" />
    <path d="M13 6v4" />
    <rect x="9" y="10" width="6" height="6" rx="1" fill={filled ? (color || "currentColor") : "none"} />
    <path d="M15 16h-4" />
  </svg>
);

export default WorkflowIcon;
