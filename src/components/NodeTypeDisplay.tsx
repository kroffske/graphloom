
import React from "react";
import { useIconRegistry } from "./IconRegistry";
import { NodeTypeAppearance } from "@/types/appearance";

type NodeTypeDisplayProps = {
  nodeType: string;
  label: string;
  appearance: NodeTypeAppearance;
};

const NodeTypeDisplay: React.FC<NodeTypeDisplayProps> = ({
  nodeType,
  label,
  appearance,
}) => {
  const iconRegistry = useIconRegistry();
  const iconName = appearance.icon || nodeType;
  const Icon = iconRegistry[iconName];

  const size = appearance.size || 64;
  const iconSize = size * 0.5;

  const nodeStyles: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: appearance.backgroundColor || "transparent",
    borderStyle: 'solid',
    borderColor: appearance.borderEnabled ? (appearance.borderColor || appearance.lineColor || "#000000") : "transparent",
    borderWidth: appearance.borderEnabled ? `${appearance.borderWidth || 1}px` : "0px",
  };
  
  return (
    <div 
        className="flex flex-col items-center justify-between p-2 rounded-lg bg-muted/30"
        style={{width: 120, height: 130}}
    >
      <div
        className="flex flex-col items-center justify-center rounded-lg shadow-md"
        style={nodeStyles}
      >
        {Icon ? (
          <Icon
            width={iconSize}
            height={iconSize}
            color={appearance.iconColor || appearance.color || "currentColor"}
            filled={true}
          />
        ) : (
            <div style={{width: iconSize, height: iconSize}} className="bg-gray-300 rounded-sm" />
        )}
      </div>
      <span className="text-xs font-medium truncate max-w-full text-center mt-1 block">
        {label}
      </span>
    </div>
  );
};

export default NodeTypeDisplay;
