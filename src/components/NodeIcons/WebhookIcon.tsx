
import React from "react";

type WebhookIconProps = {
  filled?: boolean;
  className?: string;
  "aria-label"?: string;
  color?: string;
};

const WebhookIcon = ({
  filled = false,
  className = "",
  color,
  ...props
}: WebhookIconProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-label="Webhook"
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
    <path d="M18 8a4 4 0 0 0-4-4h-2a4 4 0 0 0-4 4v4a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-2a2 2 0 0 1-2-2" />
    <path d="M12 12v4" />
    <path d="M12 4V2" />
  </svg>
);

export default WebhookIcon;
