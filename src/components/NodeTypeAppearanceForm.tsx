
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useIconRegistry } from "./IconRegistry";
import NodeTypeIconSettings from "./NodeTypeIconSettings";
import NodeTypeVisualSettings from "./NodeTypeVisualSettings";
import { useNodeAppearanceSettings } from "./hooks/useNodeAppearanceSettings";
import { resolveLabel } from "@/utils/labelJoin";

const FRIENDLY_TYPE_LABELS: Record<string, string> = {
  entity: "Entity",
  process: "Process",
  "data-store": "Data Store",
  event: "Event",
  decision: "Decision",
  "external-system": "External System",
  user: "User",
  pc: "PC"
};

type NodeTypeAppearanceFormProps = {
  onSaveCustomPresetFromJson?: () => void;
};

const NodeTypeAppearanceForm: React.FC<NodeTypeAppearanceFormProps> = ({
  onSaveCustomPresetFromJson
}) => {
  const iconRegistry = useIconRegistry();
  const iconKeys = Object.keys(iconRegistry);

  const [presetJsonString, setPresetJsonString] = useState<string>("");
  useEffect(() => {
    function handlePresetJsonSync(e: any) {
      if (typeof e.detail === "string") setPresetJsonString(e.detail);
    }
    window.addEventListener("lovable-preset-json-sync", handlePresetJsonSync);
    return () => window.removeEventListener("lovable-preset-json-sync", handlePresetJsonSync);
  }, []);

  const {
    nodeTypeKeys,
    nodeTypeLabels,
    appearance,
    setNodeTypeAppearance,
    resetNodeTypeAppearance
  } = useNodeAppearanceSettings("", presetJsonString);

  const [selectedType, setSelectedType] = useState<string>(nodeTypeKeys.length > 0 ? nodeTypeKeys[0] : "");
  useEffect(() => {
    if (!selectedType || !nodeTypeKeys.includes(selectedType)) {
      setSelectedType(nodeTypeKeys[0] || "");
    }
  }, [selectedType, nodeTypeKeys]);

  const {
    appearance: selectedAppearance,
    setNodeTypeAppearance: setAppearanceForType,
    resetNodeTypeAppearance: resetAppearanceForType,
    nodeTypeKeys: stableNodeTypeKeys,
    nodeTypeLabels: stableNodeTypeLabels
  } = useNodeAppearanceSettings(selectedType, presetJsonString);

  // Now with explicit fields for NEW settings
  const [icon, setIcon] = useState<string>(selectedAppearance.icon || selectedType);
  const [iconColor, setIconColor] = useState<string>(selectedAppearance.iconColor || "#222");
  const [borderColor, setBorderColor] = useState<string>(selectedAppearance.borderColor ?? "#e5e7eb");
  const [borderEnabled, setBorderEnabled] = useState<boolean>(selectedAppearance.borderEnabled ?? false);
  const [backgroundColor, setBackgroundColor] = useState<string>(selectedAppearance.backgroundColor || "");
  const [lineColor, setLineColor] = useState<string>(selectedAppearance.lineColor || "");
  const [size, setSize] = useState<number>(selectedAppearance.size ?? 64);
  const [labelField, setLabelField] = useState<string>(selectedAppearance.labelField || "label");
  const [iconOrder, setIconOrder] = useState<string[]>(iconKeys);

  useEffect(() => {
    setIcon(selectedAppearance.icon || selectedType);
    setIconColor(selectedAppearance.iconColor || "#222");
    setBorderColor(selectedAppearance.borderColor ?? "#e5e7eb");
    setBorderEnabled(selectedAppearance.borderEnabled ?? false);
    setBackgroundColor(selectedAppearance.backgroundColor || "");
    setLineColor(selectedAppearance.lineColor || "");
    setSize(selectedAppearance.size ?? 64);
    setLabelField(selectedAppearance.labelField || "label");
    setIconOrder(currOrder => {
      const currSet = new Set(currOrder);
      const toAdd = iconKeys.filter(k => !currSet.has(k));
      return [...currOrder.filter(k => iconKeys.includes(k)), ...toAdd];
    });
  }, [selectedType, selectedAppearance, iconKeys.join(",")]);

  function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setAppearanceForType(selectedType, {
      icon,
      iconColor,
      borderColor,
      borderEnabled,
      backgroundColor,
      lineColor,
      size,
      labelField,
      iconOrder
    });
    toast.success(`Saved default appearance for ${stableNodeTypeLabels[selectedType] || selectedType}`);
    if (onSaveCustomPresetFromJson) onSaveCustomPresetFromJson();
  }
  function handleReset() {
    resetAppearanceForType(selectedType);
    toast("Reset to default");
  }

  // Visual demo of label joining
  const attributesSample = { label: "ID-1", name: "My Name", full_name: "My Full Name" };
  const joinedLabel = resolveLabel(labelField, attributesSample, "Sample");

  const IconComponent = iconRegistry[icon];

  return (
    <section className="w-full">
      <div className="font-semibold text-lg mb-2 flex items-center gap-2">
        Node Type Appearance
        {IconComponent && (
          <span
            className="ml-2 inline-flex items-center justify-center rounded-full border"
            style={{
              background: backgroundColor || "#ede",
              borderColor: borderEnabled ? borderColor : "transparent",
              width: 28, height: 28,
              borderWidth: 2,
            }}
          >
            <IconComponent filled={true} className="w-5 h-5" color={iconColor} />
          </span>
        )}
      </div>
      <form className="flex flex-col gap-2" onSubmit={handleSave}>
        {/* Type selector */}
        <div>
          <select className="input px-2 py-1 rounded bg-muted border" id="node-type" value={selectedType} onChange={e => setSelectedType(e.target.value)} disabled={stableNodeTypeKeys.length === 0}>
            {stableNodeTypeKeys.map(key => <option key={key} value={key}>
                {stableNodeTypeLabels[key]}
              </option>)}
          </select>
        </div>
        <NodeTypeIconSettings
          iconRegistry={iconRegistry}
          icon={icon} setIcon={setIcon}
          iconColor={iconColor} setIconColor={setIconColor}
          borderColor={borderColor} setBorderColor={setBorderColor}
          borderEnabled={borderEnabled} setBorderEnabled={setBorderEnabled}
          iconOrder={iconOrder} setIconOrder={setIconOrder}
        />
        <NodeTypeVisualSettings
          backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor}
          lineColor={lineColor} setLineColor={setLineColor}
          size={size} setSize={setSize}
          labelField={labelField} setLabelField={setLabelField}
        />
        <div className="flex gap-2 mt-4">
          <Button type="submit" className="w-fit">Update node style</Button>
          <Button type="button" variant="outline" className="w-fit" onClick={handleReset}>
            Reset to Default
          </Button>
        </div>
      </form>
      <p className="text-xs text-muted-foreground mt-2">
        These settings affect all nodes of this type. You can still override them for individual nodes.<br />
        <b>Label test:</b> <span className="rounded px-2 bg-muted">{joinedLabel}</span>
      </p>
    </section>
  );
};

export default NodeTypeAppearanceForm;
