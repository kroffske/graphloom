
import React from "react";

type RuleIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const RuleIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: RuleIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Rule"
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
    <path d="M3 3h18v4H3z" fill={filled ? (color || "currentColor") : "none"} />
    <path d="M7 10h10" />
    <path d="M7 14h10" />
    <path d="M7 18h10" />
    <path d="M5 10v8" />
  </svg>
);

export default RuleIcon;
