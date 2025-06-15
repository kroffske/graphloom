
import React, { useState } from "react";
import { useGraphStore } from "@/state/useGraphStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const COLORS = [
  "#64748b", // default (slate)
  "#334155", // dark slate
  "#0ea5e9", // sky
  "#16a34a", // green
  "#eab308", // yellow
  "#ef4444", // red
  "#a21caf", // purple
];

type Props = {
  type: string;
};

export default function EdgeTypeAppearanceForm({ type }: Props) {
  const { edgeTypeAppearances, setEdgeTypeAppearance, resetEdgeTypeAppearance } = useGraphStore();
  const existing = edgeTypeAppearances[type] || {};
  const [color, setColor] = useState(existing.color ?? "#64748b");
  const [width, setWidth] = useState(existing.width ?? 2);
  const [labelField, setLabelField] = useState(existing.labelField ?? "");

  function handleSave() {
    setEdgeTypeAppearance(type, {
      color,
      width,
      labelField: labelField.trim() || undefined,
    });
  }
  function handleReset() {
    resetEdgeTypeAppearance(type);
    setColor("#64748b");
    setWidth(2);
    setLabelField("");
  }

  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="font-bold text-sm mb-1">Default Appearance for <span className="font-mono">{type}</span></div>
      <div>
        <label className="text-xs font-semibold mb-1 block">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{ background: c }}
              className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? "border-black shadow" : "border-transparent"}`}
              aria-label={`Set color ${c}`}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-8 h-6 p-0 border-none cursor-pointer"
            aria-label="Pick custom color"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold mb-1 block">Width</label>
        <div className="flex items-center gap-3">
          <Slider
            min={1}
            max={10}
            step={1}
            value={[width]}
            onValueChange={v => setWidth(v[0])}
            className="w-32"
          />
          <span className="text-xs">{width}px</span>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold mb-1 block">Label field</label>
        <Input
          value={labelField}
          onChange={e => setLabelField(e.target.value)}
          placeholder="Edge attribute to show as label"
        />
        <span className="text-xs text-muted-foreground block mt-1">E.g. set to <span className="font-mono">cost</span> to show an attribute named <span className="font-mono">cost</span> as the label for this type of edge.</span>
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={handleSave}>Save</Button>
        <Button type="button" size="sm" variant="ghost" onClick={handleReset}>
          Reset to default
        </Button>
      </div>
    </div>
  );
}
