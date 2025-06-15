import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useIconRegistry } from "./IconRegistry";
import NodeTypeIconSettings from "./NodeTypeIconSettings";
import NodeTypeVisualSettings from "./NodeTypeVisualSettings";
import { resolveLabel } from "@/utils/labelJoin";
import { NodeTypeAppearance } from "@/types/appearance";
import { NodeTypeAppearanceFormProps } from "@/types/forms";

const NodeTypeAppearanceForm: React.FC<NodeTypeAppearanceFormProps> = ({
  onSave,
  onReset,
  selectedType,
  setSelectedType,
  appearance,
  nodeTypeKeys,
  nodeTypeLabels,
}) => {
  const iconRegistry = useIconRegistry();
  const iconKeys = Object.keys(iconRegistry);

  const [icon, setIcon] = useState<string>(appearance.icon || selectedType);
  const [iconColor, setIconColor] = useState<string>(
    appearance.iconColor || "#222"
  );
  const [borderColor, setBorderColor] = useState<string>(
    appearance.borderColor ?? "#e5e7eb"
  );
  const [borderEnabled, setBorderEnabled] = useState<boolean>(
    appearance.borderEnabled ?? false
  );
  const [borderWidth, setBorderWidth] = useState<number>(
    appearance.borderWidth ?? 2
  );
  const [backgroundColor, setBackgroundColor] = useState<string>(
    appearance.backgroundColor || ""
  );
  const [size, setSize] = useState<number>(appearance.size ?? 64);
  const [labelField, setLabelField] = useState<string>(
    appearance.labelField || "label"
  );
  const [iconOrder, setIconOrder] = useState<string[]>(iconKeys);

  const isInitialMount = useRef(true);
  const prevSelectedType = useRef(selectedType);

  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    setIcon(appearance.icon || selectedType);
    setIconColor(appearance.iconColor || "#222");
    setBorderColor(appearance.borderColor ?? "#e5e7eb");
    setBorderEnabled(appearance.borderEnabled ?? false);
    setBorderWidth(appearance.borderWidth ?? 2);
    setBackgroundColor(appearance.backgroundColor || "");
    setSize(appearance.size ?? 64);
    setLabelField(appearance.labelField || "label");
    setIconOrder((currOrder) => {
      const currSet = new Set(currOrder);
      const toAdd = iconKeys.filter((k) => !currSet.has(k));
      return [...currOrder.filter((k) => iconKeys.includes(k)), ...toAdd];
    });
  }, [selectedType, appearance, iconKeys.join(",")]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevSelectedType.current = selectedType;
      return;
    }
    if (prevSelectedType.current !== selectedType) {
      prevSelectedType.current = selectedType;
      return;
    }
    const newAppearance = {
      icon,
      iconColor,
      borderColor,
      borderEnabled,
      borderWidth,
      backgroundColor,
      size,
      labelField,
      iconOrder,
    };
    onSaveRef.current(selectedType, newAppearance);
  }, [
    icon,
    iconColor,
    borderColor,
    borderEnabled,
    borderWidth,
    backgroundColor,
    size,
    labelField,
    iconOrder,
    selectedType,
  ]);

  function handleReset() {
    onReset(selectedType);
    toast("Reset to default");
  }

  // Visual demo of label joining
  const attributesSample = {
    label: "ID-1",
    name: "My Name",
    full_name: "My Full Name",
  };
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
              width: 28,
              height: 28,
              borderWidth: 2,
            }}
          >
            <IconComponent
              filled={true}
              className="w-5 h-5"
              color={iconColor}
            />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {/* Type selector */}
        <div>
          <select
            className="input px-2 py-1 rounded bg-muted border"
            id="node-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            disabled={nodeTypeKeys.length === 0}
          >
            {nodeTypeKeys.map((key) => (
              <option key={key} value={key}>
                {nodeTypeLabels[key]}
              </option>
            ))}
          </select>
        </div>
        <NodeTypeIconSettings
          iconRegistry={iconRegistry}
          icon={icon}
          setIcon={setIcon}
          iconColor={iconColor}
          setIconColor={setIconColor}
          borderColor={borderColor}
          setBorderColor={setBorderColor}
          borderEnabled={borderEnabled}
          setBorderEnabled={setBorderEnabled}
          borderWidth={borderWidth}
          setBorderWidth={setBorderWidth}
          iconOrder={iconOrder}
          setIconOrder={setIconOrder}
        />
        <NodeTypeVisualSettings
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          size={size}
          setSize={setSize}
          labelField={labelField}
          setLabelField={setLabelField}
        />
        <div className="flex gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={handleReset}
          >
            Reset to Default
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        These settings affect all nodes of this type. You can still override
        them for individual nodes.
        <br />
        <b>Label test:</b>{" "}
        <span className="rounded px-2 bg-muted">{joinedLabel}</span>
      </p>
    </section>
  );
};

export default NodeTypeAppearanceForm;
