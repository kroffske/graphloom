
import React from "react";
import { Label } from "@/components/ui/label";
import ColorCirclePicker from "./ColorCirclePicker";
import IconPicker from "./IconPicker";

// EXPANDED: Lucide icons group with more choices (add more as needed)
const ICON_GROUPS: Record<string, string[]> = {
  "Classic": ["entity", "process", "data-store", "event", "decision", "external-system"],
  "Lucide": [
    "user", "activity", "alert-circle", "airplay", "air-vent", "alarm-clock", "align-center", "align-justify", "anchor",
    "award", "baby", "battery", "bell", "book", "bookmark", "briefcase", "building", "calendar", "camera", "car", "check", "chevron-down",
    "circle", "cloud", "code", "coffee", "compass", "computer", "cpu", "database", "dice", "disc", "dollar-sign", "download", "edit", "eye",
    "file", "flag", "folder", "gift", "globe", "grid", "heart", "home", "image", "key", "layers", "layout", "lightbulb", "link", "list", "lock",
    "map", "menu", "message-square", "mic", "moon", "music", "paperclip", "phone", "pie-chart", "play", "plus", "printer", "refresh-cw", "save",
    "scissors", "search", "settings", "share", "shield", "shopping-cart", "shuffle", "sliders", "star", "sun", "tag", "thumbs-up", "trash", "trending-up",
    "tv", "umbrella", "unlock", "upload", "user-check", "users", "video", "watch", "wifi", "zap"
  ]
};

type NodeTypeIconSettingsProps = {
  iconRegistry: Record<string, React.ComponentType<any>>;
  icon: string;
  setIcon: (v: string) => void;
  iconColor: string;
  setIconColor: (color: string) => void;
  borderColor: string;
  setBorderColor: (color: string) => void;
  borderEnabled: boolean;
  setBorderEnabled: (enabled: boolean) => void;
  iconOrder: string[];
  setIconOrder: (arr: string[]) => void;
};

const NodeTypeIconSettings: React.FC<NodeTypeIconSettingsProps> = ({
  iconRegistry,
  icon,
  setIcon,
  iconColor,
  setIconColor,
  borderColor,
  setBorderColor,
  borderEnabled,
  setBorderEnabled,
  iconOrder,
  setIconOrder,
}) => {
  const [selectedGroup, setSelectedGroup] = React.useState<string>("Classic");
  const groupKeys = Object.keys(ICON_GROUPS);
  const groupedKeys = ICON_GROUPS[selectedGroup]
    ? ICON_GROUPS[selectedGroup]
    : Object.keys(iconRegistry);

  const IconComponent = iconRegistry[icon];

  return (
    <div>
      <Label>Icon</Label>
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
        {IconComponent && (
          <span className="mr-2">
            <span
              className="inline-flex items-center justify-center rounded-full border"
              style={{
                width: 32,
                height: 32,
                borderColor: borderEnabled ? borderColor : "transparent",
                borderWidth: 2,
                background: "#fff",
              }}
            >
              <IconComponent filled={true} className="w-6 h-6" color={iconColor} />
            </span>
          </span>
        )}
        <span className="text-xs text-muted-foreground">{icon}</span>
      </div>
      <IconPicker
        iconRegistry={iconRegistry}
        value={icon}
        onChange={setIcon}
        order={groupedKeys.filter(k => iconOrder.includes(k)).concat(iconOrder.filter(k => !groupedKeys.includes(k)))}
        setOrder={setIconOrder}
      />
      <div className="mt-3 flex flex-col gap-2">
        {/* Icon Color */}
        <div>
          <Label htmlFor="icon-color" className="mb-1 block">Icon Color</Label>
          <ColorCirclePicker
            value={iconColor}
            onChange={setIconColor}
          />
        </div>
        {/* Node Border Option */}
        <div className="flex items-center gap-2 mt-2">
          <input
            id="node-border-enabled"
            type="checkbox"
            checked={borderEnabled}
            onChange={e => setBorderEnabled(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <Label htmlFor="node-border-enabled" className="mb-0">
            Node Border Enabled
          </Label>
          {borderEnabled && (
            <ColorCirclePicker
              value={borderColor}
              onChange={setBorderColor}
              className="ml-2"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeTypeIconSettings;
