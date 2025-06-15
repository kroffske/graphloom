
import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import ColorCirclePicker from "./ColorCirclePicker";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { NodeTypeVisualSettingsProps } from "@/types/forms";

/**
 * Controls for node background, border color, size and label mapping
 */

const NodeTypeVisualSettings: React.FC<NodeTypeVisualSettingsProps> = ({
  backgroundColor,
  setBackgroundColor,
  size,
  setSize,
  labelTemplate,
  setLabelTemplate,
}) => {
  // Allow toggling the backgroundColor (enable/disable)
  const isBgEnabled = backgroundColor.trim() !== "";
  return (
    <div className="flex flex-col gap-4 mt-3">
      {/* Node Background Color */}
      <div>
        <Label>Node Background Color</Label>
        <div className="flex items-center gap-2 mt-1">
          <Switch
            id="enable-bg-color"
            checked={isBgEnabled}
            onCheckedChange={(checked) =>
              setBackgroundColor(checked ? "#e5e7eb" : "")
            }
          />
          <Label htmlFor="enable-bg-color" className="mb-0 font-normal">
            Enable
          </Label>
          {isBgEnabled && (
            <ColorCirclePicker
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="appearance-size">Node Size ({size ?? 64}px)</Label>
        <Slider
          id="appearance-size"
          min={40}
          max={120}
          step={2}
          value={[size]}
          onValueChange={([s]) => setSize(s)}
          className="w-full"
        />
      </div>
      <div>
        <Label htmlFor="appearance-label-template">Label Template</Label>
        <Input
          id="appearance-label-template"
          value={labelTemplate}
          onChange={(e) => setLabelTemplate(e.target.value)}
          className="mt-1"
          placeholder="e.g. {label} ({type})"
          title="Use {property} to insert values from node data."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use {'{property}'} to insert values. E.g. {'{label}'}.
        </p>
      </div>
    </div>
  );
};

export default NodeTypeVisualSettings;
