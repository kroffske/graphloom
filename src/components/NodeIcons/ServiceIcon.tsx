
import React from "react";

type ServiceIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const ServiceIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: ServiceIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Service"
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
    <rect x="3" y="3" width="18" height="18" rx="2" fill={filled ? (color || "currentColor") : "none"} />
    <circle cx="12" cy="12" r="3" stroke={color || "currentColor"} />
    <path d="M12 9v-1.5M12 15v1.5M15.55 13.5l1.06 1.06M7.39 8.44l-1.06-1.06M16.61 7.39l1.06-1.06M6.33 16.5l-1.06 1.06" stroke={color || "currentColor"} />
  </svg>
);

export default ServiceIcon;
