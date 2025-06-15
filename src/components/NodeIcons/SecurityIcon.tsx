
import React from "react";

type SecurityIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const SecurityIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: SecurityIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Security"
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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={filled ? (color || "currentColor") : "none"} />
  </svg>
);

export default SecurityIcon;
