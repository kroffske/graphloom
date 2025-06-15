
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

/**
 * Controls for node background, border color, size and label mapping
 * Props:
 * - backgroundColor, setBackgroundColor
 * - lineColor, setLineColor
 * - size, setSize
 * - labelField, setLabelField
 */
type NodeTypeVisualSettingsProps = {
  backgroundColor: string;
  setBackgroundColor: (c: string) => void;
  lineColor: string;
  setLineColor: (c: string) => void;
  size: number;
  setSize: (n: number) => void;
  labelField: string;
  setLabelField: (s: string) => void;
};

const NodeTypeVisualSettings: React.FC<NodeTypeVisualSettingsProps> = ({
  backgroundColor,
  setBackgroundColor,
  lineColor,
  setLineColor,
  size,
  setSize,
  labelField,
  setLabelField,
}) => (
  <div className="flex flex-col gap-4 mt-3">
    <div>
      <Label htmlFor="node-bg-color">Node Background Color</Label>
      <Input
        id="node-bg-color"
        value={backgroundColor}
        onChange={e => setBackgroundColor(e.target.value)}
        placeholder="#RRGGBBAA"
      />
    </div>
    <div>
      <Label htmlFor="node-line-color">Node Border Color</Label>
      <Input
        id="node-line-color"
        value={lineColor}
        onChange={e => setLineColor(e.target.value)}
        placeholder="#RRGGBB"
      />
    </div>
    <div>
      <Label htmlFor="appearance-size">
        Node Size ({size ?? 64}px)
      </Label>
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
      <Label htmlFor="appearance-label-field">Label Field</Label>
      <Input
        id="appearance-label-field"
        value={labelField}
        onChange={e => setLabelField(e.target.value)}
        placeholder='e.g. "label", "name", "attribute"'
      />
    </div>
  </div>
);

export default NodeTypeVisualSettings;
