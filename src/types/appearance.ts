export type NodeTypeAppearance = {
  icon?: string;
  color?: string; // legacy primary color
  size?: number;
  labelTemplate?: string;
  backgroundColor?: string;
  lineColor?: string; // legacy border color
  iconOrder?: string[];
  // New unified properties
  iconColor?: string;
  iconSize?: number; // Size of icon within the node
  borderEnabled?: boolean;
  borderColor?: string;
  borderWidth?: number;
  // deprecated
  showIconCircle?: boolean;
  iconCircleColor?: string;
};

export type EdgeTypeAppearance = {
  color?: string;
  width?: number;
  labelTemplate?: string;
  icon?: string; // for future use
  opacity?: number;
  strokeDasharray?: string;
  label?: string;
  showArrows?: boolean;
};

export type NodeTypeAppearanceMap = Record<string, NodeTypeAppearance>;
export type EdgeTypeAppearanceMap = Record<string, EdgeTypeAppearance>;

export type PresetConfig = {
    nodeTypes?: NodeTypeAppearanceMap;
    edgeTypes?: EdgeTypeAppearanceMap;
}

export type Preset = {
    name: string;
    key: string;
    config: PresetConfig;
};
