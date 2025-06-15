
import React from "react";

const DecisionIcon = ({ filled = false, className = "", ...props }: { filled?: boolean; className?: string; "aria-label"?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Decision"
    className={className}
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinejoin="round"
    strokeLinecap="round"
    {...props}
  >
    <polygon points="12 3 21 12 12 21 3 12" fill={filled ? "currentColor" : "none"} />
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontFamily="Arial" fill="currentColor"
      aria-label="Decision" >?</text>
  </svg>
);

export default DecisionIcon;
