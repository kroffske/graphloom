
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AppearancePresetsSection from "./AppearancePresetsSection";
import { useAppearanceManager } from "@/hooks/appearance/useAppearanceManager";
import AppearanceImportExport from "./GlobalSettings/AppearanceImportExport";

type GlobalSettingsPanelProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const GlobalSettingsPanel: React.FC<GlobalSettingsPanelProps> = ({ open, onOpenChange }) => {
  const { completePresetObject, handlePresetSaveFromJson } = useAppearanceManager();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] max-w-full flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle>Global Settings</SheetTitle>
        </SheetHeader>
        {/* Import/Export */}
        <AppearanceImportExport
          completePresetObject={completePresetObject}
          onImport={handlePresetSaveFromJson}
        />
        <AppearancePresetsSection />
        <div className="flex-1" />
        <p className="text-xs text-muted-foreground mt-2">
          Import or export your appearance presets as a JSON file.
        </p>
      </SheetContent>
    </Sheet>
  );
};

export default GlobalSettingsPanel;
