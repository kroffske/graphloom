
import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import ColorCirclePicker from "./ColorCirclePicker";

/**
 * Controls for node background, border color, size and label mapping
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
      <ColorCirclePicker value={backgroundColor} onChange={setBackgroundColor} />
    </div>
    <div>
      <Label htmlFor="node-line-color">Node Border Color</Label>
      <ColorCirclePicker value={lineColor} onChange={setLineColor} />
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
      <Label htmlFor="appearance-label-field">Label Field(s)</Label>
      <input
        id="appearance-label-field"
        value={labelField}
        onChange={e => setLabelField(e.target.value)}
        className="input px-2 py-1 rounded border mt-1"
        placeholder='e.g. label,name,full_name'
        title="Separate field names by comma, space, dash, or underscore"
      />
      <p className="text-xs text-muted-foreground mt-1">
        Separate multiple fields with <b>,</b> <b>-</b> <b>_</b> or <b>space</b>
      </p>
    </div>
  </div>
);

export default NodeTypeVisualSettings;
