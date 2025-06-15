
import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import GlobalSettingsSection from "@/components/GlobalSettingsSection";
import AppearancePresetsSection from "@/components/AppearancePresetsSection";
import NodeTypeAppearanceSettings from "@/components/NodeTypeAppearanceSettings";

/**
 * SettingsSidebar displays a sidebar with tabs for high-level settings:
 * Global, Presets, Node Types, Advanced.
 * Each section loads the corresponding config panel.
 */
const tabLabels = [
  { key: "global", label: "Global" },
  { key: "presets", label: "Presets" },
  { key: "nodeTypes", label: "Node Types" },
  { key: "advanced", label: "Advanced" },
];

const SettingsSidebar: React.FC = () => {
  const [tab, setTab] = useState("global");

  return (
    <Sidebar className="z-30 bg-card border-l border-border min-w-[330px] max-w-[400px] w-full">
      <SidebarContent className="p-0 h-full flex flex-col">
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="flex items-center gap-2 mt-4 mb-2 pl-4">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="font-bold text-lg tracking-wide">Settings</span>
          </SidebarGroupLabel>
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <Tabs
              value={tab}
              onValueChange={setTab}
              className="flex flex-col flex-1 w-full"
            >
              <TabsList className="w-full mb-0 bg-background gap-2 px-4 pt-2 border-none">
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
              <div className="flex-1 overflow-y-auto min-h-0 p-4">
                <TabsContent value="global" className="p-0">
                  <GlobalSettingsSection />
                </TabsContent>
                <TabsContent value="presets" className="p-0">
                  <AppearancePresetsSection />
                  {/* You may wish to expand this with more preset controls later */}
                </TabsContent>
                <TabsContent value="nodeTypes" className="p-0">
                  <NodeTypeAppearanceSettings />
                </TabsContent>
                <TabsContent value="advanced" className="p-0">
                  <div className="p-2 text-sm text-muted-foreground">
                    Advanced settings (coming soon).
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SettingsSidebar;
