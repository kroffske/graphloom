
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import IconPicker from "./IconPicker";

/**
 * Controls for node icon, icon circle, and icon order
 * Props:
 * - iconRegistry: Record<string, IconComponent>
 * - icon: selected icon string
 * - setIcon: setter
 * - showIconCircle: boolean
 * - setShowIconCircle: setter
 * - iconCircleColor: string
 * - setIconCircleColor: setter
 * - iconOrder: string[]
 * - setIconOrder: setter
 */
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
  return (
    <div>
      <Label>Icon</Label>
      <IconPicker
        iconRegistry={iconRegistry}
        value={icon}
        onChange={setIcon}
        order={iconOrder}
        setOrder={setIconOrder}
      />
      <div className="flex items-center mt-2">
        <Label htmlFor="show-icon-circle" className="mb-0 mr-2">Show Icon Circle</Label>
        <Switch
          id="show-icon-circle"
          checked={!!showIconCircle}
          onCheckedChange={setShowIconCircle}
        />
        {showIconCircle && (
          <Input
            id="icon-circle-color"
            className="ml-3 max-w-[100px]"
            type="text"
            value={iconCircleColor}
            onChange={e => setIconCircleColor(e.target.value)}
            placeholder="#e9e9e9"
          />
        )}
      </div>
    </div>
  );
};

export default NodeTypeIconSettings;
