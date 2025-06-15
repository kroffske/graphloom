
import React from "react";

type LoadBalancerIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const LoadBalancerIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: LoadBalancerIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Load Balancer"
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
    <path d="M2 9h4v12H2z" fill={filled ? (color || "currentColor") : "none"}/>
    <path d="M18 9h4v12h-4z" fill={filled ? (color || "currentColor") : "none"}/>
    <path d="M8 9h8v12H8z" fill={filled ? (color || "currentColor") : "none"}/>
    <path d="M12 3v6" />
  </svg>
);

export default LoadBalancerIcon;
