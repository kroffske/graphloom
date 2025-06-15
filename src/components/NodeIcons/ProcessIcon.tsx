
import React from "react";

type ProcessIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const ProcessIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: ProcessIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Process"
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
    <circle cx={12} cy={12} r={10} fill={filled ? (color || "currentColor") : "none"} />
    <g>
      <path d="M12 8v4h4" stroke={color || "currentColor"} />
      <circle cx={12} cy={12} r={4} stroke={color || "currentColor"} fill="none" />
    </g>
  </svg>
);

export default ProcessIcon;
