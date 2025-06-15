
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useIconRegistry } from "./IconRegistry";
import { GraphNode, useGraphStore } from "@/state/useGraphStore";

// Helper: Color input supporting alpha
function ColorSwatchInput({ label, value, onChange, id, allowAlpha = false }: { label: string, value: string, onChange: (v: string) => void, id: string, allowAlpha?: boolean }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value && /^#([0-9a-fA-F]{6,8})$/.test(value) ? value.length === 9 ? value : `${value}ff` : "#000000"}
          className="w-8 h-8 border rounded"
          onChange={(e) => {
            let hex = e.target.value;
            if (!allowAlpha && hex.length > 7) hex = hex.slice(0, 7);
            onChange(hex);
          }}
        />
        <Input
          id={id + "-hex"}
          className="max-w-[105px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={allowAlpha ? "#RRGGBBAA" : "#RRGGBB"}
        />
      </div>
    </div>
  );
}

export default function NodeSettingsForm({ node, onSaveSuccess }: { node: GraphNode; onSaveSuccess?: () => void }) {
  const { nodes, setNodes } = useGraphStore();
  const [tab, setTab] = useState("general");

  // Local, editable form state
  const [label, setLabel] = useState(node.label ?? "");
  const [color, setColor] = useState(
    typeof node.attributes.color === "string" ? node.attributes.color : ""
  );
  const [appearance, setAppearance] = useState<NonNullable<GraphNode["appearance"]>>(
    node.appearance || {}
  );

  React.useEffect(() => {
    setLabel(node.label ?? "");
    setColor(typeof node.attributes.color === "string" ? node.attributes.color : "");
    setAppearance(node.appearance || {});
  }, [node]);

  // Icon Picker
  const iconRegistry = useIconRegistry();
  const iconKeys = Object.keys(iconRegistry);

  function IconPicker({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
    return (
      <div className="grid grid-cols-3 gap-2 mt-2">
        {iconKeys.map((k) => {
          const Icon = iconRegistry[k];
          return (
            <button
              type="button"
              key={k}
              onClick={() => onChange(k)}
              className={`flex items-center justify-center rounded border-2 p-2 ${
                value === k ? "border-primary" : "border-muted"
              } bg-background hover:bg-accent`}
              aria-label={k}
            >
              <Icon className="w-7 h-7" filled={value === k} />
            </button>
          );
        })}
      </div>
    );
  }

  function onSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    // Update node in store
    const newNodes = nodes.map((n) =>
      n.id === node.id
        ? {
            ...n,
            label,
            attributes: { ...n.attributes, color },
            appearance: { ...appearance },
          }
        : n
    );
    setNodes(newNodes);
    toast.success("Node settings saved!");
    onSaveSuccess?.();
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full mt-1">
      <TabsList className="grid w-full grid-cols-3 mb-3">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      {/* GENERAL TAB */}
      <TabsContent value="general">
        <form className="flex flex-col gap-4 mt-1" onSubmit={onSave}>
          <div>
            <Label htmlFor="node-label">Label</Label>
            <Input
              id="node-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Node label"
              required
            />
          </div>
          <div>
            <Label htmlFor="node-color">Color</Label>
            <Input
              id="node-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g., blue or #3483eb"
            />
          </div>
          <Button type="submit" className="mt-2 w-fit">Save</Button>
        </form>
      </TabsContent>
      {/* APPEARANCE TAB */}
      <TabsContent value="appearance">
        <form className="flex flex-col gap-5 mt-1" onSubmit={onSave}>
          {/* ICON SECTION */}
          <div>
            <Label>Icon</Label>
            <IconPicker
              value={appearance.icon || node.type}
              onChange={(icon) => setAppearance((prev) => ({ ...prev, icon }))}
            />
          </div>

          {/* ICON CIRCLE SETTINGS */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="show-icon-circle" className="mb-0">Show Icon Circle</Label>
              <Switch
                id="show-icon-circle"
                checked={!!appearance.showIconCircle}
                onCheckedChange={(v) =>
                  setAppearance((p) => ({ ...p, showIconCircle: v }))
                }
              />
            </div>
            {appearance.showIconCircle && (
              <ColorSwatchInput
                label="Icon Circle Color"
                value={appearance.iconCircleColor || "#e9e9e9"}
                onChange={v => setAppearance((p) => ({ ...p, iconCircleColor: v }))}
                id="icon-circle-color"
              />
            )}
          </div>

          {/* COLORS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorSwatchInput
              label="Node Background Color"
              value={appearance.backgroundColor || ""}
              onChange={v => setAppearance((p) => ({ ...p, backgroundColor: v }))}
              id="background-color"
              allowAlpha
            />
            <ColorSwatchInput
              label="Node Border Color"
              value={appearance.lineColor || ""}
              onChange={v => setAppearance((p) => ({ ...p, lineColor: v }))}
              id="line-color"
            />
          </div>
          {/* SIZE */}
          <div>
            <Label htmlFor="appearance-size">
              Node Size ({appearance.size ?? 64}px)
            </Label>
            <Slider
              id="appearance-size"
              min={40}
              max={120}
              step={2}
              value={[appearance.size ?? 64]}
              onValueChange={([size]) =>
                setAppearance((p) => ({ ...p, size }))
              }
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="appearance-label-field">Label Field</Label>
            <Input
              id="appearance-label-field"
              value={appearance.labelField || "label"}
              onChange={(e) =>
                setAppearance((p) => ({
                  ...p,
                  labelField: e.target.value,
                }))
              }
              placeholder='e.g. "label", "name", "attribute"'
            />
          </div>
          <Button type="submit" className="mt-2 w-fit">Save</Button>
        </form>
      </TabsContent>
      {/* ADVANCED TAB */}
      <TabsContent value="advanced">
        <div className="p-2 text-sm text-muted-foreground">
          Advanced settings coming soon.
        </div>
      </TabsContent>
    </Tabs>
  );
}
