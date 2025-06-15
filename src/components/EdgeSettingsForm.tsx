import React, { useState, useMemo } from "react";
import { useGraphStore } from "@/state/useGraphStore";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { EdgeSettingsFormProps } from "@/types/forms";
import { resolveLabelTemplate } from "@/utils/labelTemplate";

const COLORS = [
  "#64748b", // default (slate)
  "#334155", // dark slate
  "#0ea5e9", // sky
  "#16a34a", // green
  "#eab308", // yellow
  "#ef4444", // red
  "#a21caf", // purple
];

function getAttributeValue(
  attributes: Record<string, any> | undefined,
  key: string | undefined
): string {
  if (!attributes || !key) return "";
  const val = attributes[key];
  return val !== undefined && val !== null ? String(val) : "";
}

export default function EdgeSettingsForm({ edge }: EdgeSettingsFormProps) {
  const {
    edgeAppearances,
    setEdgeAppearance,
    showEdgeLabels,
    toggleEdgeLabels,
    edgeTypeAppearances,
  } = useGraphStore();

  // Defaults from type/overall graph structure
  const typeDefault = edgeTypeAppearances[edge.type || "default"] || {};
  const current = { ...edge.appearance, ...edgeAppearances[edge.id] };

  // Tabs
  const [tab, setTab] = useState<"general" | "appearance" | "advanced">("general");

  // State for all appearance controls (per edge)
  const [label, setLabel] = useState(current.label ?? "");
  const [labelTemplate, setLabelTemplate] = useState(current.labelTemplate ?? typeDefault.labelTemplate ?? "");
  const [color, setColor] = useState(current.color ?? typeDefault.color ?? "#64748b");
  const [width, setWidth] = useState(current.width ?? typeDefault.width ?? 2);

  // Watch for changes in the edge/type default and update local state if the id changes (editing another edge)
  React.useEffect(() => {
    setLabel(current.label ?? "");
    setLabelTemplate(current.labelTemplate ?? typeDefault.labelTemplate ?? "");
    setColor(current.color ?? typeDefault.color ?? "#64748b");
    setWidth(current.width ?? typeDefault.width ?? 2);
  }, [edge.id, JSON.stringify(current), JSON.stringify(typeDefault)]);

  // Current type defaults for display
  const typeDefaults = {
    color: typeDefault.color ?? "#64748b",
    width: typeDefault.width ?? 2,
    labelTemplate: typeDefault.labelTemplate ?? "",
  };

  // Detect if edge appearance differs from type default
  const isCustomized =
    current.color !== undefined ||
    current.width !== undefined ||
    current.label !== undefined ||
    current.labelTemplate !== undefined;

  // The effective resolved appearance values for this edge (shown in a "preview")
  const effective = useMemo(() => {
    const effectiveLabelTemplate = labelTemplate.trim() !== "" ? labelTemplate : typeDefaults.labelTemplate;
    
    let effectiveLabel = "";
    if (label.trim() !== "") {
      effectiveLabel = label.trim();
    } else if (effectiveLabelTemplate) {
      effectiveLabel = resolveLabelTemplate(effectiveLabelTemplate, { ...edge, ...edge.attributes }, "...");
    }

    return {
      color,
      width,
      label: effectiveLabel,
      labelTemplate: effectiveLabelTemplate,
    };
  }, [color, width, label, labelTemplate, typeDefaults, edge]);

  function handleSave() {
    setEdgeAppearance(edge.id, {
      label,
      color,
      width,
      labelTemplate: labelTemplate.trim() || undefined,
    });
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

      {/* GENERAL TAB (unchanged for now) */}
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

      {/* APPEARANCE TAB - ENHANCED */}
      {tab === "appearance" && (
        <div className="flex flex-col gap-5">
          {/* 1. Visual Properties section */}
          <div>
            <div className="font-semibold text-xs mb-2 text-muted-foreground">
              Visual Properties
            </div>
            <div className="flex flex-wrap gap-4">
              {/* Color */}
              <div>
                <Label className="text-xs mb-1 block">Edge color</Label>
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
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Type default: <span className="font-mono">{typeDefaults.color}</span>
                </div>
              </div>
              {/* Width */}
              <div>
                <Label className="text-xs mb-1 block">Edge width</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[width]}
                    onValueChange={(v) => setWidth(v[0])}
                    className="w-24"
                  />
                  <span className="text-xs">{width}px</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Type default: <span className="font-mono">{typeDefaults.width}</span> px
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 2. Label Configuration section */}
          <div>
            <div className="font-semibold text-xs mb-2 text-muted-foreground">
              Label Configuration
            </div>
            {/* Label Template */}
            <div className="mb-2">
              <Label className="text-xs mb-1 block">Label template <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                value={labelTemplate}
                onChange={(e) => setLabelTemplate(e.target.value)}
                placeholder={typeDefaults.labelTemplate ? `e.g. ${typeDefaults.labelTemplate}` : "{source.label} -> {target.label}"}
                className="w-full"
              />
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {typeDefaults.labelTemplate
                  ? <>Type default: <span className="font-mono">{typeDefaults.labelTemplate}</span></>
                  : <>No default set for this type.</>
                }
              </div>
            </div>
            {/* Custom label value */}
            <div className="mb-1">
              <Label className="text-xs mb-1 block">Custom label override <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Type a custom label"
                className="w-full"
              />
              <div className="text-[11px] text-muted-foreground mt-0.5">
                If blank, will use the template.
              </div>
            </div>
          </div>
          <Separator />

          {/* 3. Preview/effective info */}
          <div className="rounded bg-accent/30 p-2 text-xs text-accent-foreground">
            <div className="font-semibold">Preview:</div>
            <ul className="pl-4">
              <li>
                <span className="font-mono">color</span>: <span>{effective.color}</span>
                {color !== typeDefaults.color && (
                  <span className="ml-1 italic text-muted-foreground">(customized)</span>
                )}
              </li>
              <li>
                <span className="font-mono">width</span>: <span>{effective.width}</span>px
                {width !== typeDefaults.width && (
                  <span className="ml-1 italic text-muted-foreground">(customized)</span>
                )}
              </li>
              <li>
                <span className="font-mono">labelTemplate</span>: <span>{effective.labelTemplate || <span className="italic text-muted-foreground">none</span>}</span>
                {labelTemplate.trim() !== "" && (
                  <span className="ml-1 italic text-muted-foreground">(customized)</span>
                )}
              </li>
              <li>
                <span className="font-mono">label</span>: <span>{effective.label ? <span className="font-semibold">{effective.label}</span> : <span className="italic text-muted-foreground">none</span>}</span>
              </li>
            </ul>
          </div>

          {/* 4. Actions */}
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

      {/* ADVANCED TAB (unchanged) */}
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
