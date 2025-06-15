
import React from "react";

type ApiIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const ApiIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: ApiIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="API"
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
    <path d="M12 8V4m0 16v-4m4-8h4M4 12h4m6 0h-2m-4 0H8m6 6v-2m0-4v-2" />
    <circle cx="12" cy="12" r="2" fill={filled ? (color || "currentColor") : "none"} />
  </svg>
);

export default ApiIcon;
