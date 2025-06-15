
import React from "react";

type StreamIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const StreamIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: StreamIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Stream"
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
    <path d="M3 7c3-3 6 3 9 0s6-3 9 0" />
    <path d="M3 17c3 3 6-3 9 0s6 3 9 0" />
    <path d="M3 12h18" />
  </svg>
);

export default StreamIcon;
