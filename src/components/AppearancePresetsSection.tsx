
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

type Preset = {
  name: string;
  key: string;
  config: Record<string, any>;
};

type AppearancePresetsSectionProps = {
  onPresetSelect?: (presetConfig: Record<string, any>, presetKey: string) => void;
  selectedPresetKey?: string;
  appearancePresets?: Preset[]; // passed from parent, dynamic
};

const AppearancePresetsSection: React.FC<AppearancePresetsSectionProps> = ({
  onPresetSelect,
  selectedPresetKey,
  appearancePresets,
}) => {
  // Use injected list if present, else fallback to built-in
  const presets: Preset[] = React.useMemo(() => {
    if (appearancePresets && Array.isArray(appearancePresets)) return appearancePresets;
    return []; // fallback to none if not provided (should always be provided now)
  }, [appearancePresets]);

  return (
    <section className="w-full flex flex-col gap-2">
      {/* No duplicate 'Appearance Presets' heading, let parent render if needed */}
      <div className="flex flex-col gap-1 my-1">
        {presets.map((p) => (
          <Button
            key={p.key}
            variant={selectedPresetKey === p.key ? "default" : "secondary"}
            size="sm"
            className={`justify-start w-full border ${
              selectedPresetKey === p.key
                ? "ring-2 ring-primary bg-primary text-primary-foreground font-bold"
                : ""
            }`}
            onClick={() => onPresetSelect?.(p.config, p.key)}
            type="button"
            aria-pressed={selectedPresetKey === p.key}
          >
            {p.name}
          </Button>
        ))}
      </div>
    </section>
  );
};

export default AppearancePresetsSection;
