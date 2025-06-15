
import React from "react";

type GatewayIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const GatewayIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: GatewayIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Gateway"
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
    <path d="M6 20V10a6 6 0 0 1 12 0v10" />
    <path d="M3 20h18" />
    <path d="M12 10V4" />
    <path d="M10 4h4" />
  </svg>
);

export default GatewayIcon;
