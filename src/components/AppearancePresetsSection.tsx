
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const dummyPresets = [
  { name: "Classic Blue", key: "classic-blue" },
  { name: "Dark Mode Neon", key: "dark-neon" },
];

const AppearancePresetsSection: React.FC = () => {
  // TODO: wire up state/persistence as needed.
  return (
    <section>
      <div className="flex flex-row items-center gap-2 mb-2">
        <Settings className="w-4 h-4 text-muted-foreground" />
        <span className="font-semibold text-sm">Appearance Presets</span>
      </div>
      {/* Preset list */}
      <div className="flex flex-col gap-1 my-1">
        {dummyPresets.map((p) => (
          <Button key={p.key} variant="secondary" size="sm" className="justify-start w-full">
            {p.name}
          </Button>
        ))}
      </div>
      {/* Manage/Save UI (scaffold for now) */}
      <div className="flex flex-row gap-2 mt-1">
        <Button variant="outline" size="sm" disabled>Save Current as Preset</Button>
        <Button variant="outline" size="sm" disabled>Manage</Button>
      </div>
    </section>
  );
};

export default AppearancePresetsSection;
