
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { appearancePresets } from "@/data/appearancePresets";

type AppearancePresetsSectionProps = {
  onPresetSelect?: (presetConfig: Record<string, any>, presetKey: string) => void;
  selectedPresetKey?: string;
};

const AppearancePresetsSection: React.FC<AppearancePresetsSectionProps> = ({
  onPresetSelect,
  selectedPresetKey,
}) => {
  return (
    <section className="w-full flex flex-col gap-2">
      {/* No duplicate 'Appearance Presets' heading, let parent render if needed */}
      <div className="flex flex-col gap-1 my-1">
        {appearancePresets.map((p) => (
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
      <div className="flex flex-row gap-2 mt-1">
        <Button variant="outline" size="sm" disabled>
          Save Current as Preset
        </Button>
        <Button variant="outline" size="sm" disabled>
          Manage
        </Button>
      </div>
    </section>
  );
};

export default AppearancePresetsSection;

