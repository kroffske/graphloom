
import React from "react";

type ConnectorIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const ConnectorIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: ConnectorIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Connector"
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
    <path d="M10 12H3" />
    <path d="M14 12h7" />
    <path d="M10 9v6" />
    <path d="M14 9v6" />
    <rect x="9" y="8" width="6" height="8" rx="1" fill={filled ? (color || "currentColor") : "none"} />
  </svg>
);

export default ConnectorIcon;
