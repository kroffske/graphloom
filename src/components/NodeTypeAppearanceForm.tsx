import React, { useState, useMemo } from "react";
import { useGraphStore } from "@/state/useGraphStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useIconRegistry } from "./IconRegistry";
import IconPicker from "./IconPicker";

// Node type labels
const FRIENDLY_TYPE_LABELS: Record<string, string> = {
  entity: "Entity",
  process: "Process",
  "data-store": "Data Store",
  event: "Event",
  decision: "Decision",
  "external-system": "External System",
};

const NodeTypeAppearanceForm: React.FC = () => {
  const iconRegistry = useIconRegistry();
  const iconKeys = Object.keys(iconRegistry);

  const {
    nodeTypeAppearances,
    setNodeTypeAppearance,
    resetNodeTypeAppearance,
    nodes,
  } = useGraphStore();

  // --- Gather all known node types from: built-in, custom appearances, loaded preset (from window or config), and actual nodes
  const [presetJsonString, setPresetJsonString] = useState<string>(
    // Try to sync with editable JSON from config if available - fallback handled below
    ""
  );
  // Hack: pull the editable JSON config if it's placed in window (by GlobalSettingsSection) for live sync
  React.useEffect(() => {
    // Listen for custom event to set preset JSON string if present
    function handlePresetJsonSync(e: any) {
      if (typeof e.detail === "string") setPresetJsonString(e.detail);
    }
    window.addEventListener("lovable-preset-json-sync", handlePresetJsonSync);
    return () => window.removeEventListener("lovable-preset-json-sync", handlePresetJsonSync);
  }, []);

  const nodeTypeKeys: string[] = useMemo(() => {
    // Collect: built-in, appearance keys, present nodes, AND keys found in the config/preset JSON (if present)
    const builtIn = ["entity", "process", "data-store", "event", "decision", "external-system"];
    const fromAppearances = Object.keys(nodeTypeAppearances ?? {});
    const fromNodes = nodes.map((n) => n.type);
    let fromPresetJson: string[] = [];
    // Safely parse preset JSON if string exists
    if (presetJsonString) {
      try {
        const parsed = JSON.parse(presetJsonString);
        if (parsed && typeof parsed === "object") {
          fromPresetJson = Object.keys(parsed);
        }
      } catch {
        // Ignore invalid JSON
      }
    }
    // Deduplicate and return
    return Array.from(new Set([...builtIn, ...fromAppearances, ...fromNodes, ...fromPresetJson]));
  }, [nodeTypeAppearances, nodes, presetJsonString]);

  const nodeTypeLabels: Record<string, string> = useMemo(() => {
    const labels: Record<string, string> = {};
    nodeTypeKeys.forEach(
      (key) => (labels[key] = FRIENDLY_TYPE_LABELS[key] || key)
    );
    return labels;
  }, [nodeTypeKeys]);
  // Select first available node type by default
  const [selectedType, setSelectedType] = useState(nodeTypeKeys[0] || "");
  React.useEffect(() => {
    if (!nodeTypeKeys.includes(selectedType) && nodeTypeKeys[0]) {
      setSelectedType(nodeTypeKeys[0]);
    }
  }, [nodeTypeKeys, selectedType]);
  const selectedLabel = nodeTypeLabels[selectedType] || selectedType;

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

  return (
    <section className="w-full">
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
                {nodeTypeLabels[key]}
              </option>
            ))}
          </select>
        </div>
        {/* Controls for node appearance settings */}
        <div className="flex flex-col gap-4 mt-3">
          {/* Icon Picker */}
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
        <div className="flex gap-2 mt-4">
          <Button type="submit" className="w-fit">Save</Button>
          <Button type="button" variant="outline" className="w-fit" onClick={handleReset}>
            Reset to Default
          </Button>
        </div>
      </form>
      <p className="text-xs text-muted-foreground mt-2">
        These settings affect all nodes of this type. You can still override them for individual nodes.
      </p>
    </section>
  );
};

export default NodeTypeAppearanceForm;
