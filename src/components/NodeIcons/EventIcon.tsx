
import React from "react";

type EventIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const EventIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: EventIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Event"
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
    <circle cx={12} cy={12} r={10} stroke={color || "currentColor"} />
    <polyline points="12 8 13.5 12 10.5 12 12 16" stroke={color || "currentColor"} />
    <polygon points="10.5 12 13.5 12 12 8" fill={filled ? (color || "currentColor") : "none"} />
  </svg>
);

export default EventIcon;
