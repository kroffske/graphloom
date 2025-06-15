
import React, { useState } from "react";
import { useGraphStore, GraphEdge } from "@/state/useGraphStore";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

type Props = {
  edge: GraphEdge;
};

const COLORS = [
  "#64748b", // default (slate)
  "#334155", // dark slate
  "#0ea5e9", // sky
  "#16a34a", // green
  "#eab308", // yellow
  "#ef4444", // red
  "#a21caf", // purple
];

export default function EdgeSettingsForm({ edge }: Props) {
  const {
    edgeAppearances,
    setEdgeAppearance,
    showEdgeLabels,
    toggleEdgeLabels,
    edgeTypeAppearances,
    resetEdgeTypeAppearance,
  } = useGraphStore();
  const current = { ...edge.appearance, ...edgeAppearances[edge.id] };
  const typeDefault = edgeTypeAppearances[edge.type || "default"] || {};
  const [tab, setTab] = useState<"general" | "appearance" | "advanced">("general");

  // General tab state
  // Label: per-edge override, but if not present, look for typeDefault.labelField etc
  const [label, setLabel] = useState(
    current.label ??
      (() => {
        const field =
          typeDefault.labelField && edge.attributes
            ? edge.attributes[typeDefault.labelField]
            : undefined;
        return field !== undefined
          ? String(field)
          : edge.appearance?.label ?? "";
      })()
  );
  // Appearance tab state
  const [color, setColor] = useState(current.color ?? typeDefault.color ?? "#64748b");
  const [width, setWidth] = useState(current.width ?? typeDefault.width ?? 2);

  // Customization detection: is this edge's appearance different from its type default?
  const isCustomized =
    current.color !== undefined ||
    current.width !== undefined ||
    current.label !== undefined;

  function handleSave() {
    setEdgeAppearance(edge.id, { label, color, width });
  }

  function handleReset() {
    setEdgeAppearance(edge.id, {});
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex mb-1 gap-2">
        {[
          { key: "general", label: "General" },
          { key: "appearance", label: "Appearance" },
          { key: "advanced", label: "Advanced" },
        ].map((t) => (
          <Button
            type="button"
            size="sm"
            key={t.key}
            variant={tab === t.key ? "default" : "outline"}
            className="capitalize rounded-full"
            onClick={() => setTab(t.key as any)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab === "general" && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1 block">Label</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={showEdgeLabels}
              onCheckedChange={() => toggleEdgeLabels()}
              id="show-labels"
            />
            <label htmlFor="show-labels" className="text-xs">
              Show labels
            </label>
          </div>
          <div className="flex gap-2 mt-2">
            <Button type="button" size="sm" className="self-start" onClick={handleSave}>
              Save
            </Button>
            {isCustomized && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="self-start"
                onClick={handleReset}
              >
                Reset to type default
              </Button>
            )}
          </div>
        </div>
      )}

      {tab === "appearance" && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1 block">Edge color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
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
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-6 p-0 border-none cursor-pointer"
                aria-label="Pick custom color"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">Edge width</label>
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
          <div className="flex gap-2 mt-2">
            <Button type="button" size="sm" className="self-start" onClick={handleSave}>
              Save
            </Button>
            {isCustomized && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="self-start"
                onClick={handleReset}
              >
                Reset to type default
              </Button>
            )}
          </div>
        </div>
      )}

      {tab === "advanced" && (
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-xs">
            No advanced options yet.
          </span>
        </div>
      )}
    </div>
  );
}
