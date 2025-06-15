
import React from "react";

const DataStoreIcon = ({ filled = false, className = "", ...props }: { filled?: boolean; className?: string; "aria-label"?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Data Store"
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
    <ellipse cx={12} cy={7} rx={8} ry={3} fill={filled ? "currentColor" : "none"} />
    <rect x={4} y={7} width={16} height={10} fill={filled ? "currentColor" : "none"} />
    <ellipse cx={12} cy={17} rx={8} ry={3} />
  </svg>
);

export default DataStoreIcon;
