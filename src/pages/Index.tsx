
import React, { useState } from "react";
import { IconRegistryProvider } from "@/components/IconRegistry";
import GraphD3Canvas from "@/components/GraphD3Canvas";
import UploadPanel from "@/components/UploadPanel";
import InspectorPanel from "@/components/InspectorPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SidebarProvider } from "@/components/ui/sidebar";
import GlobalSettingsPanel from "@/components/GlobalSettingsPanel";
import { Settings } from "lucide-react";

const Index = () => {
  // Only "upload" and "graph"
  const [mainTab, setMainTab] = useState<"upload" | "graph">("graph");
  // Move showSettings state down for context-sensitive panel open
  const [showSettings, setShowSettings] = useState(false);

  return (
    <IconRegistryProvider>
      <div className="bg-background min-h-screen w-full flex flex-col">
        {/* Header */}
        <header className="w-full flex items-center gap-4 px-6 py-4 border-b border-border shadow-sm bg-card z-20 relative">
          <h1 className="text-2xl font-bold tracking-wide text-primary">
            Graph Visualization UI
          </h1>
          <ThemeToggle />
          {/* Removed: Settings button and GlobalSettingsPanel from header */}
        </header>
        {/* Tabs for Upload & Graph Only */}
        <Tabs
          value={mainTab}
          onValueChange={(v) => setMainTab(v as "upload" | "graph")}
          className="w-full"
        >
          <TabsList className="w-full mb-0 border-b border-border pt-2 px-2 bg-background">
            <TabsTrigger value="upload" className="flex-1 text-lg py-2">
              Upload & Explore
            </TabsTrigger>
            <TabsTrigger value="graph" className="flex-1 text-lg py-2">
              Graph
            </TabsTrigger>
          </TabsList>
          {/* Main Content */}
          <SidebarProvider>
            <div className="flex-1 flex flex-row w-full min-h-0 max-h-[calc(100vh-70px)] overflow-hidden">
              <main className="flex-1 flex flex-col pl-7 pr-2 pt-6 pb-0 max-w-[calc(100vw-370px)]">
                <TabsContent value="upload" className="p-0 h-full w-full">
                  {/* Add: settings button (top right) only in upload tab */}
                  <div className="flex flex-row justify-end mb-3">
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/10 border border-border transition-colors"
                      aria-label="Open global settings"
                      onClick={() => setShowSettings(true)}
                      title="Global Settings"
                      tabIndex={0}
                      type="button"
                    >
                      <Settings className="w-5 h-5" aria-hidden="true" />
                      <span className="sr-only">Settings</span>
                    </button>
                  </div>
                  <UploadPanel />
                  {/* Settings panel, only in Upload tab */}
                  <GlobalSettingsPanel open={showSettings} onOpenChange={setShowSettings} />
                </TabsContent>
                <TabsContent value="graph" className="p-0 h-full w-full">
                  <GraphD3Canvas />
                </TabsContent>
              </main>
              <InspectorPanel />
            </div>
          </SidebarProvider>
        </Tabs>
      </div>
    </IconRegistryProvider>
  );
};

export default Index;

