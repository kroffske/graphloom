
import React from "react";
import { Label } from "@/components/ui/label";
import ColorCirclePicker from "./ColorCirclePicker";
import IconPicker from "./IconPicker";
import { Slider } from "@/components/ui/slider";

// EXPANDED: Lucide icons group with more choices (add more as needed)
const ICON_GROUPS: Record<string, string[]> = {
  "Classic": ["entity", "process", "data-store", "event", "decision", "external-system"],
  "Lucide": [
    "user", "activity", "alert-circle", "airplay", "air-vent", "alarm-clock", "align-center", "align-justify", "anchor",
    "archive", "archive-x", "award", "baby", "battery", "bell", "bell-off", "book", "bookmark", "box", "briefcase", "building", "calendar", "camera", "car", "check", "chevron-down",
    "circle", "clipboard", "clock", "cloud", "code", "cog", "coffee", "compass", "computer", "copy", "cpu", "database", "dice", "disc", "dollar-sign", "download", "edit", "eye",
    "file", "filter", "flag", "folder", "gift", "globe", "grid", "heart", "help-circle", "home", "image", "info", "key", "layers", "layout", "lightbulb", "link", "list", "lock",
    "log-in", "log-out", "mail", "map-pin", "map", "menu", "message-square", "mic", "minus", "monitor", "moon", "more-horizontal", "more-vertical", "move", "music", "package", "paperclip", "pause", "pen", "percent",
    "phone", "pie-chart", "play", "plus", "power", "printer", "refresh-cw", "save",
    "scissors", "search", "send", "settings", "share", "shield", "shopping-cart", "shuffle", "sidebar", "signal", "sliders", "star", "sun", "tag", "target", "terminal", "thermometer", "thumbs-down", "thumbs-up", "trash", "trash-2", "trending-up",
    "truck", "tv", "umbrella", "unlock", "upload", "user-check", "users", "video", "volume", "watch", "wifi", "x", "youtube", "zap"
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
  borderWidth: number;
  setBorderWidth: (width: number) => void;
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
  borderWidth,
  setBorderWidth,
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
        </div>

        {borderEnabled && (
          <div className="grid gap-4 pl-6 pt-2">
            <div>
              <Label htmlFor="node-border-color" className="mb-2 block">Border Color</Label>
              <ColorCirclePicker
                value={borderColor}
                onChange={setBorderColor}
              />
            </div>

            <div>
              <Label htmlFor="appearance-border-width">Border Width ({borderWidth ?? 2}px)</Label>
              <Slider
                id="appearance-border-width"
                min={1}
                max={10}
                step={0.5}
                value={[borderWidth ?? 2]}
                onValueChange={([s]) => setBorderWidth(s)}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeTypeIconSettings;
