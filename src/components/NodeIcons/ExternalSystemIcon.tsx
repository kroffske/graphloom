
import React from "react";

type ExternalSystemIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const ExternalSystemIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: ExternalSystemIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="External System"
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
    <ellipse cx={12} cy={16} rx={8} ry={3} fill={filled ? (color || "currentColor") : "none"} stroke={color || "currentColor"} />
    <path d="M4 16V8a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8" stroke={color || "currentColor"} />
    <path d="M18.5 12l2.5 2v-4z" stroke={color || "currentColor"} />
    <path d="M12 8V4" stroke={color || "currentColor"} />
    <path d="M8 4h8" stroke={color || "currentColor"} />
  </svg>
);

export default ExternalSystemIcon;
