
import React from "react";

type MicroserviceIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const MicroserviceIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: MicroserviceIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Microservice"
    className={className}
    width={24}
    height={24}
    fill={filled ? (color || "currentColor") : "none"}
    stroke={color || "currentColor"}
    strokeWidth={2}
    strokeLinejoin="round"
    strokeLinecap="round"
    {...props}
  >
    <circle cx="6" cy="6" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="6" r="2" />
  </svg>
);

export default MicroserviceIcon;
