
import React, { useState, useMemo } from "react";
import { useGraphStore } from "@/state/useGraphStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useIconRegistry } from "./IconRegistry";
import DraggableIcon from "./DraggableIcon";
import { Textarea } from "@/components/ui/textarea";

/**
 * Settings UI for node type default appearance.
 * All nodes with the given type use these as defaults (unless overridden).
 */
const NODE_TYPE_LABELS: Record<string, string> = {
  entity: "Entity",
  process: "Process",
  "data-store": "Data Store",
  event: "Event",
  decision: "Decision",
  "external-system": "External System",
};

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function NodeTypeAppearanceSettings() {
  const iconRegistry = useIconRegistry();
  const iconKeys = Object.keys(iconRegistry);

  const {
    nodeTypeAppearances,
    setNodeTypeAppearance,
    resetNodeTypeAppearance,
  } = useGraphStore();

  const nodeTypeKeys = useMemo(() => Object.keys(NODE_TYPE_LABELS), []);
  const [selectedType, setSelectedType] = useState(nodeTypeKeys[0] || "");
  const selectedLabel = NODE_TYPE_LABELS[selectedType] || selectedType;

  // Local state for editing
  const [tab, setTab] = useState("appearance");
  // Get current appearance for type, or provide defaults
  const appearance = nodeTypeAppearances?.[selectedType] || {};

  // Mirror all values locally for editing
  const [icon, setIcon] = useState<string>(appearance.icon || selectedType);
  const [backgroundColor, setBackgroundColor] = useState<string>(appearance.backgroundColor || "");
  const [lineColor, setLineColor] = useState<string>(appearance.lineColor || "");
  const [size, setSize] = useState<number>(appearance.size || 64);
  const [labelField, setLabelField] = useState<string>(appearance.labelField || "label");
  const [showIconCircle, setShowIconCircle] = useState<boolean>(!!appearance.showIconCircle);
  const [iconCircleColor, setIconCircleColor] = useState<string>(appearance.iconCircleColor || "#e9e9e9");
  const [iconOrder, setIconOrder] = useState<string[]>(iconKeys);

  // Resync local state if node type or appearance defaults change
  React.useEffect(() => {
    setIcon(appearance.icon || selectedType);
    setBackgroundColor(appearance.backgroundColor || "");
    setLineColor(appearance.lineColor || "");
    setSize(appearance.size ?? 64);
    setLabelField(appearance.labelField || "label");
    setShowIconCircle(!!appearance.showIconCircle);
    setIconCircleColor(appearance.iconCircleColor || "#e9e9e9");
    setIconOrder((currOrder) => {
      // Update with any new icons that have appeared
      const currSet = new Set(currOrder);
      const toAdd = iconKeys.filter((k) => !currSet.has(k));
      return [...currOrder.filter((k) => iconKeys.includes(k)), ...toAdd];
    });
  }, [selectedType, appearance, iconKeys.join(",")]);

  function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setNodeTypeAppearance(selectedType, {
      icon,
      backgroundColor,
      lineColor,
      size,
      labelField,
      showIconCircle,
      iconCircleColor,
      iconOrder,
    });
    toast.success(`Saved default appearance for ${selectedLabel}`);
  }

  function handleReset() {
    resetNodeTypeAppearance(selectedType);
    toast("Reset to default");
  }

  function handleCopyPreset() {
    try {
      navigator.clipboard.writeText(JSON.stringify(nodeTypeAppearances, null, 2));
      toast.success("Appearance preset JSON copied!");
    } catch {
      toast.error("Unable to copy JSON!");
    }
  }

  function IconPicker({
    value,
    onChange,
    order,
    setOrder,
  }: {
    value?: string;
    onChange: (v: string) => void;
    order: string[];
    setOrder: (arr: string[]) => void;
  }) {
    // Drag+drop logic
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    return (
      <div className="grid grid-cols-3 gap-2 mt-2 relative select-none">
        {order.map((k, idx) => {
          const Icon = iconRegistry[k];
          const isDragging = dragIndex === idx;
          const isDropTarget =
            dragOverIndex === idx && dragIndex !== null && dragIndex !== dragOverIndex;
          return (
            <div
              key={k}
              className={`
                relative
                ${isDropTarget ? "ring-2 ring-blue-400 z-20" : ""}
                ${isDragging ? "opacity-0" : ""}
              `}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragOverIndex !== idx) setDragOverIndex(idx);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== idx) {
                  setOrder(reorder(order, dragIndex, idx));
                  setDragIndex(null);
                  setDragOverIndex(null);
                }
              }}
              onDragLeave={(_) => {
                if (dragOverIndex === idx) setDragOverIndex(null);
              }}
            >
              <DraggableIcon
                Icon={Icon}
                aria-label={k}
                filled={value === k}
                selected={value === k}
                onSelect={() => onChange(k)}
                draggable
                onDragStart={e => {
                  setDragIndex(idx);
                  setDragOverIndex(idx);
                  const ghost = document.createElement("div");
                  ghost.style.position = "absolute";
                  ghost.style.left = "-9999px";
                  document.body.appendChild(ghost);
                  e.dataTransfer.setDragImage(ghost, 0, 0);
                }}
                onDragEnd={(_) => {
                  setDragIndex(null);
                  setDragOverIndex(null);
                  setTimeout(() => {
                    const ghosts = document.querySelectorAll("body > div");
                    ghosts.forEach((g) => {
                      if ((g as HTMLElement).style.position === "absolute" && (g as HTMLElement).style.left === "-9999px") {
                        g.remove();
                      }
                    });
                  }, 10);
                }}
              />
              {isDropTarget && (
                <div
                  className="absolute inset-0 rounded border-2 border-blue-500 pointer-events-none z-30"
                  style={{ borderStyle: "dashed" }}
                />
              )}
            </div>
          );
        })}
        <div className="col-span-3 text-xs text-muted-foreground mt-2">
          Drag and drop to reorder icons within the grid.
        </div>
      </div>
    );
  }

  // Layout: Responsive flex-col on mobile, flex-row on desktop
  return (
    <section className="border border-border rounded-lg bg-card shadow p-5 flex flex-col md:flex-row gap-6 mt-2 w-full">
      {/* --- Editor left column --- */}
      <div className="w-full md:w-2/3 flex-shrink-0">
        <div className="font-semibold text-lg mb-2 flex items-center gap-2">
          Node Type Appearance Settings
        </div>
        <form className="flex flex-col gap-2" onSubmit={handleSave}>
          {/* Node type selector */}
          <div>
            <Label htmlFor="node-type">Node Type</Label>
            <select
              className="input px-2 py-1 rounded bg-muted border"
              id="node-type"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
            >
              {nodeTypeKeys.map(key => (
                <option key={key} value={key}>
                  {NODE_TYPE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <Tabs value={tab} onValueChange={setTab} className="w-full mt-1">
            <TabsList className="grid w-full grid-cols-3 mb-2">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="appearance">
              <div className="flex flex-col gap-4">
                {/* Icon Picker */}
                <div>
                  <Label>Icon</Label>
                  <IconPicker
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
            </TabsContent>
            <TabsContent value="general">
              <div className="p-2 text-sm text-muted-foreground">
                General settings coming soon.
              </div>
            </TabsContent>
            <TabsContent value="advanced">
              <div className="p-2 text-sm text-muted-foreground">
                Advanced settings coming soon.
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex gap-2 mt-2">
            <Button type="submit" className="w-fit">Save</Button>
            <Button type="button" variant="outline" className="w-fit" onClick={handleReset}>
              Reset to Default
            </Button>
          </div>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          These settings affect all nodes of this type. You can still override them for individual nodes.
        </p>
      </div>
      {/* --- JSON config right column --- */}
      <div className="w-full md:w-1/3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-base">Preset JSON Config</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyPreset}
            type="button"
          >Copy</Button>
        </div>
        <Textarea
          value={JSON.stringify(nodeTypeAppearances, null, 2)}
          readOnly
          className="bg-muted resize-none font-mono text-xs min-h-[300px] max-h-[440px] h-full"
        />
      </div>
    </section>
  );
}

