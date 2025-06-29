
import React from "react";
import { Label } from "@/components/ui/label";
import ColorCirclePicker from "./ColorCirclePicker";
import IconPicker from "./IconPicker";
import { Slider } from "@/components/ui/slider";
import { ICON_GROUPS } from "@/config/iconConstants";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-full my-2">
            <SelectValue placeholder="Select icon group" />
          </SelectTrigger>
          <SelectContent>
            {groupKeys.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <IconComponent
                filled={true}
                className="w-6 h-6"
                color={iconColor}
              />
            </span>
          </span>
        )}
        <span className="text-xs text-muted-foreground">{icon}</span>
      </div>
      <IconPicker
        iconRegistry={iconRegistry}
        value={icon}
        onChange={setIcon}
        order={groupedKeys
          .filter((k) => iconOrder.includes(k))
          .concat(iconOrder.filter((k) => !groupedKeys.includes(k)))}
        setOrder={setIconOrder}
      />
      <div className="mt-3 flex flex-col gap-2">
        {/* Icon Color */}
        <div>
          <Label htmlFor="icon-color" className="mb-1 block">
            Icon Color
          </Label>
          <ColorCirclePicker value={iconColor} onChange={setIconColor} />
        </div>
        {/* Node Border Option */}
        <div className="flex items-center gap-2 mt-2">
          <Switch
            id="node-border-enabled"
            checked={borderEnabled}
            onCheckedChange={setBorderEnabled}
          />
          <Label htmlFor="node-border-enabled" className="mb-0 font-normal">
            Node Border Enabled
          </Label>
        </div>

        {borderEnabled && (
          <div className="grid gap-4 pl-6 pt-2">
            <div>
              <Label htmlFor="node-border-color" className="mb-2 block">
                Border Color
              </Label>
              <ColorCirclePicker
                value={borderColor}
                onChange={setBorderColor}
              />
            </div>

            <div>
              <Label htmlFor="appearance-border-width">
                Border Width ({borderWidth ?? 2}px)
              </Label>
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
