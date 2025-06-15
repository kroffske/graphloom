
import React from "react";

type FirewallIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const FirewallIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: FirewallIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Firewall"
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
    <path d="M3 7h18M3 12h18M3 17h18" />
    <path d="M12 7V3" />
    <path d="M7 12V8" />
    <path d="M17 12V8" />
    <path d="M7 17v-4" />
    <path d="M17 17v-4" />
    <path d="M12 17v-4" />
  </svg>
);

export default FirewallIcon;
