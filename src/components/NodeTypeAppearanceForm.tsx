
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useIconRegistry } from "./IconRegistry";
import NodeTypeIconSettings from "./NodeTypeIconSettings";
import NodeTypeVisualSettings from "./NodeTypeVisualSettings";
import { useNodeAppearanceSettings } from "./hooks/useNodeAppearanceSettings";
import { Label } from "@/components/ui/label";

// Node type labels
const FRIENDLY_TYPE_LABELS: Record<string, string> = {
  entity: "Entity",
  process: "Process",
  "data-store": "Data Store",
  event: "Event",
  decision: "Decision",
  "external-system": "External System",
};

type NodeTypeAppearanceFormProps = {
  onSaveCustomPresetFromJson?: () => void;
};

const NodeTypeAppearanceForm: React.FC<NodeTypeAppearanceFormProps> = ({ onSaveCustomPresetFromJson }) => {
  const iconRegistry = useIconRegistry();
  const iconKeys = Object.keys(iconRegistry);

  // Preset JSON for collecting all types
  const [presetJsonString, setPresetJsonString] = useState<string>("");
  useEffect(() => {
    function handlePresetJsonSync(e: any) {
      if (typeof e.detail === "string") setPresetJsonString(e.detail);
    }
    window.addEventListener("lovable-preset-json-sync", handlePresetJsonSync);
    return () => window.removeEventListener("lovable-preset-json-sync", handlePresetJsonSync);
  }, []);

  // --- FIX: Move selectedType above hook and pass to hook directly ---
  // Get all node types from the hook to populate the dropdown
  const {
    nodeTypeKeys,
    nodeTypeLabels,
    appearance,
    setNodeTypeAppearance,
    resetNodeTypeAppearance,
  } = useNodeAppearanceSettings(
    // We'll pass real selectedType (not a constant) here below!
    // Place holder for now, pick first valid type once, then user changes it
    "" /* this will be replaced below */
    , presetJsonString
  );

  // --- Actually manage selectedType in form, and provide to hook ---
  const [selectedType, setSelectedType] = useState<string>(nodeTypeKeys[0] || "");
  // SYNCHRONIZE selectedType if type keys change (e.g. on data load)
  useEffect(() => {
    if (!selectedType && nodeTypeKeys[0]) {
      setSelectedType(nodeTypeKeys[0]);
    } else if (selectedType && !nodeTypeKeys.includes(selectedType) && nodeTypeKeys.length > 0) {
      setSelectedType(nodeTypeKeys[0]);
    }
  }, [nodeTypeKeys, selectedType]);

  // --- Now call useNodeAppearanceSettings AGAIN but with real selectedType ---
  const {
    appearance: selectedAppearance,
    setNodeTypeAppearance: setAppearanceForType,
    resetNodeTypeAppearance: resetAppearanceForType,
    // pass-through for keys/labels
    nodeTypeKeys: stableNodeTypeKeys,
    nodeTypeLabels: stableNodeTypeLabels
  } = useNodeAppearanceSettings(selectedType, presetJsonString);

  // Local form state for visuals/icons, mirror store nodeTypeAppearances shape
  const [icon, setIcon] = useState<string>(selectedAppearance.icon || selectedType);
  const [backgroundColor, setBackgroundColor] = useState<string>(selectedAppearance.backgroundColor || "");
  const [lineColor, setLineColor] = useState<string>(selectedAppearance.lineColor || "");
  const [size, setSize] = useState<number>(selectedAppearance.size || 64);
  const [labelField, setLabelField] = useState<string>(selectedAppearance.labelField || "label");
  const [showIconCircle, setShowIconCircle] = useState<boolean>(!!selectedAppearance.showIconCircle);
  const [iconCircleColor, setIconCircleColor] = useState<string>(
    selectedAppearance.iconCircleColor || "#e9e9e9"
  );
  const [iconOrder, setIconOrder] = useState<string[]>(iconKeys);

  // Re-sync local state when type/appearance changes
  useEffect(() => {
    setIcon(selectedAppearance.icon || selectedType);
    setBackgroundColor(selectedAppearance.backgroundColor || "");
    setLineColor(selectedAppearance.lineColor || "");
    setSize(selectedAppearance.size ?? 64);
    setLabelField(selectedAppearance.labelField || "label");
    setShowIconCircle(!!selectedAppearance.showIconCircle);
    setIconCircleColor(selectedAppearance.iconCircleColor || "#e9e9e9");
    setIconOrder((currOrder) => {
      const currSet = new Set(currOrder);
      const toAdd = iconKeys.filter((k) => !currSet.has(k));
      return [...currOrder.filter((k) => iconKeys.includes(k)), ...toAdd];
    });
  }, [selectedType, selectedAppearance, iconKeys.join(",")]);

  function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setAppearanceForType(selectedType, {
      icon,
      backgroundColor,
      lineColor,
      size,
      labelField,
      showIconCircle,
      iconCircleColor,
      iconOrder,
    });
    toast.success(`Saved default appearance for ${stableNodeTypeLabels[selectedType] || selectedType}`);
    if (onSaveCustomPresetFromJson) onSaveCustomPresetFromJson();
  }

  function handleReset() {
    resetAppearanceForType(selectedType);
    toast("Reset to default");
  }

  return (
    <section className="w-full">
      <div className="font-semibold text-lg mb-2 flex items-center gap-2">
        Node Type Appearance Settings
      </div>
      <form className="flex flex-col gap-2" onSubmit={handleSave}>
        {/* Type selector */}
        <div>
          <Label htmlFor="node-type">Node Type</Label>
          <select
            className="input px-2 py-1 rounded bg-muted border"
            id="node-type"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            {stableNodeTypeKeys.map(key => (
              <option key={key} value={key}>
                {stableNodeTypeLabels[key]}
              </option>
            ))}
          </select>
        </div>
        {/* Appearance controls */}
        <NodeTypeIconSettings
          iconRegistry={iconRegistry}
          icon={icon}
          setIcon={setIcon}
          showIconCircle={showIconCircle}
          setShowIconCircle={setShowIconCircle}
          iconCircleColor={iconCircleColor}
          setIconCircleColor={setIconCircleColor}
          iconOrder={iconOrder}
          setIconOrder={setIconOrder}
        />
        <NodeTypeVisualSettings
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          lineColor={lineColor}
          setLineColor={setLineColor}
          size={size}
          setSize={setSize}
          labelField={labelField}
          setLabelField={setLabelField}
        />
        <div className="flex gap-2 mt-4">
          <Button type="submit" className="w-fit">Update node style</Button>
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
