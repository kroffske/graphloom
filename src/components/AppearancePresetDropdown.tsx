
import React from "react";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectValue } from "@/components/ui/select";

type Preset = {
  name: string;
  key: string;
  config: Record<string, any>;
};

type AppearancePresetDropdownProps = {
  presets: Preset[];
  selectedKey?: string;
  onSelect: (presetKey: string) => void;
};

const AppearancePresetDropdown: React.FC<AppearancePresetDropdownProps> = ({
  presets = [],
  selectedKey,
  onSelect,
}) => {
  return (
    <div className="flex gap-3 items-center">
      <span className="text-sm font-medium text-muted-foreground">Preset:</span>
      <Select value={selectedKey} onValueChange={onSelect}>
        <SelectTrigger className="w-[210px] bg-card border">
          <SelectValue placeholder="Select a preset" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Appearance Presets</SelectLabel>
            {presets.map((p) => (
              <SelectItem key={p.key} value={p.key}>
                {p.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AppearancePresetDropdown;
