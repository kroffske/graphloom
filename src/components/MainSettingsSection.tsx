
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import GlobalSettingsSection from "@/components/GlobalSettingsSection";
import AppearancePresetsSection from "@/components/AppearancePresetsSection";
import NodeTypeAppearanceSettings from "@/components/NodeTypeAppearanceSettings";

type MainSettingsSectionProps = {
  onFillExample: () => void;
};

const tabLabels = [
  { key: "global", label: "Global" },
  { key: "presets", label: "Presets" },
  { key: "nodeTypes", label: "Node Types" },
  { key: "advanced", label: "Advanced" },
];

const MainSettingsSection: React.FC<MainSettingsSectionProps> = ({ onFillExample }) => {
  const [tab, setTab] = useState("global");

  return (
    <div className="w-full md:w-[650px] max-w-4xl min-w-[340px] flex flex-col gap-3 mx-auto">
      <div className="flex items-center gap-2 mb-2 mt-3">
        <Settings className="w-5 h-5 text-muted-foreground" />
        <span className="font-bold text-xl tracking-wide">Settings</span>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1 w-full">
        <TabsList className="w-full mb-0 bg-background gap-2 px-0 pt-0 border-none">
          {tabLabels.map(tabObj => (
            <TabsTrigger
              key={tabObj.key}
              value={tabObj.key}
              className="flex-1 text-base py-2"
            >
              {tabObj.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex-1 w-full min-h-0 mt-1">
          <TabsContent value="global" className="p-0">
            <GlobalSettingsSection onFillExample={onFillExample} />
          </TabsContent>
          <TabsContent value="presets" className="p-0">
            <AppearancePresetsSection />
          </TabsContent>
          <TabsContent value="nodeTypes" className="p-0">
            <NodeTypeAppearanceSettings />
          </TabsContent>
          <TabsContent value="advanced" className="p-0">
            <div className="p-4 text-sm text-muted-foreground">
              Advanced settings (coming soon).
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default MainSettingsSection;
