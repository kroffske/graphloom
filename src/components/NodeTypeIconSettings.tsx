
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import ColorCirclePicker from "./ColorCirclePicker";
import IconPicker from "./IconPicker";

// Example groupings for extension point
const ICON_GROUPS: Record<string, string[]> = {
  "Classic": ["entity", "process", "data-store", "event", "decision", "external-system"],
  // Add more groups and commercial/industry ones here if you add icons
};

type NodeTypeIconSettingsProps = {
  iconRegistry: Record<string, React.ComponentType<any>>;
  icon: string;
  setIcon: (v: string) => void;
  showIconCircle: boolean;
  setShowIconCircle: (b: boolean) => void;
  iconCircleColor: string;
  setIconCircleColor: (c: string) => void;
  iconOrder: string[];
  setIconOrder: (arr: string[]) => void;
};

const NodeTypeIconSettings: React.FC<NodeTypeIconSettingsProps> = ({
  iconRegistry,
  icon,
  setIcon,
  showIconCircle,
  setShowIconCircle,
  iconCircleColor,
  setIconCircleColor,
  iconOrder,
  setIconOrder,
}) => {
  // NEW: Choose group for icon sets (extend as more icons/groups are added)
  const [selectedGroup, setSelectedGroup] = useState<string>("Classic");
  const groupKeys = Object.keys(ICON_GROUPS);
  const groupedKeys = ICON_GROUPS[selectedGroup] || Object.keys(iconRegistry);

  // Determine selected icon's component
  const IconComponent = iconRegistry[icon];

  return (
    <div>
      <Label>Icon</Label>
      {/* Icon group select (if more groups in future) */}
      {groupKeys.length > 1 && (
        <select
          className="input px-2 py-1 rounded bg-muted border mb-2"
          value={selectedGroup}
          onChange={e => setSelectedGroup(e.target.value)}
        >
          {groupKeys.map(g => <option key={g}>{g}</option>)}
        </select>
      )}
      <div className="flex items-center mb-2">
        {IconComponent &&
          <span className="mr-2">
            {/* Icon preview reflects selected icon and iconCircleColor */}
            <span
              className="inline-flex items-center justify-center rounded-full border"
              style={{
                width: 32,
                height: 32,
                background: showIconCircle ? iconCircleColor : "transparent",
                borderColor: showIconCircle ? iconCircleColor : "#e5e7eb",
                borderWidth: showIconCircle ? 2 : 1,
              }}
            >
              <IconComponent filled={true} className="w-6 h-6" color={iconCircleColor || "#111"} />
            </span>
          </span>
        }
        <span className="text-xs text-muted-foreground">{icon}</span>
      </div>
      <IconPicker
        iconRegistry={iconRegistry}
        value={icon}
        onChange={setIcon}
        order={iconOrder}
        setOrder={setIconOrder}
      />
      <div className="flex items-center mt-2">
        <Label htmlFor="show-icon-circle" className="mb-0 mr-2">Show Icon Circle</Label>
        <input
          id="show-icon-circle"
          type="checkbox"
          checked={!!showIconCircle}
          onChange={e => setShowIconCircle(e.target.checked)}
          className="form-checkbox h-4 w-4 text-blue-600"
        />
        {showIconCircle && (
          <div className="ml-3 flex items-center gap-1">
            <ColorCirclePicker
              value={iconCircleColor}
              onChange={setIconCircleColor}
            />
            <span className="ml-1 text-xs text-muted-foreground">Icon Circle Color</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeTypeIconSettings;
