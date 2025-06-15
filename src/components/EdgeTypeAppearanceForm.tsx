import React, { useState, useEffect, useRef } from "react";
import { useGraphStore } from "@/state/useGraphStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { EdgeTypeAppearance } from "@/types/appearance";
import { EdgeTypeAppearanceFormProps } from "@/types/forms";

// Default color choices
const COLORS = [
  "#64748b", // default (slate)
  "#334155", // dark slate
  "#0ea5e9", // sky
  "#16a34a", // green
  "#eab308", // yellow
  "#ef4444", // red
  "#a21caf", // purple
];

/**
 * Edge type appearance form, styled like node form.
 * If `allTypes` and `onTypeChange` are provided, renders type dropdown at top.
 */
export default function EdgeTypeAppearanceForm({
  type,
  allTypes,
  onTypeChange,
  onSave,
  onReset,
}: EdgeTypeAppearanceFormProps) {
  const { edgeTypeAppearances } = useGraphStore();
  const existing = edgeTypeAppearances[type] || {};
  const [color, setColor] = useState(existing.color ?? "#64748b");
  const [width, setWidth] = useState(existing.width ?? 2);
  const [labelField, setLabelField] = useState(existing.labelField ?? "");

  const isInitialMount = useRef(true);
  const prevType = useRef(type);

  // Keep local state in sync with changes to the selected type, so changing type resets values
  useEffect(() => {
    setColor(edgeTypeAppearances[type]?.color ?? "#64748b");
    setWidth(edgeTypeAppearances[type]?.width ?? 2);
    setLabelField(edgeTypeAppearances[type]?.labelField ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, edgeTypeAppearances]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevType.current = type;
      return;
    }
    if (prevType.current !== type) {
      prevType.current = type;
      return;
    }
    onSave(type, {
      color,
      width,
      labelField: labelField.trim() || undefined,
    });
  }, [color, width, labelField, onSave, type]);

  function handleReset() {
    onReset(type);
    // Reset UI to default values
    setColor("#64748b");
    setWidth(2);
    setLabelField("");
    toast("Reset to default");
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
      {/* Type selector dropdown, if using in global settings; matches node type UI */}
      {allTypes && onTypeChange && (
        <div>
          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger
              className="w-full h-8 text-xs bg-muted border"
              id="edge-type"
            >
              <SelectValue placeholder="Select edge type" />
            </SelectTrigger>
            <SelectContent>
              {allTypes.map((t) => (
                <SelectItem value={t} key={t} className="text-xs capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {/* Color choices */}
        <label className="text-xs font-semibold mb-1 block">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{ background: c }}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                color === c ? "border-black shadow" : "border-transparent"
              }`}
              aria-label={`Set color ${c}`}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-6 p-0 border-none cursor-pointer"
            aria-label="Pick custom color"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold mb-1 block">Width</label>
        <div className="flex items-center gap-3">
          <Slider
            min={1}
            max={10}
            step={1}
            value={[width]}
            onValueChange={(v) => setWidth(v[0])}
            className="w-32"
          />
          <span className="text-xs">{width}px</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold mb-1 block">
          Label field
        </label>
        <Input
          value={labelField}
          onChange={(e) => setLabelField(e.target.value)}
          placeholder="Edge attribute to show as label"
        />
        <span className="text-xs text-muted-foreground block mt-1">
          E.g. set to <span className="font-mono">cost</span> to show an
          attribute named <span className="font-mono">cost</span> as the label
          for this type of edge.
        </span>
      </div>
      {/* Unified button layout */}
      <div className="flex gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          size="sm"
          onClick={handleReset}
        >
          Reset to Default
        </Button>
      </div>
    </form>
  );
}
