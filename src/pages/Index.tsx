
import React, { useState } from "react";
import { IconRegistryProvider } from "@/components/IconRegistry";
import GraphD3Canvas from "@/components/GraphD3Canvas";
import UploadPanel from "@/components/UploadPanel";
import InspectorPanel from "@/components/InspectorPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { useGraphStore } from "@/state/useGraphStore";
import { NodeSettingsSidebar } from "@/components/NodeSettingsSidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SidebarProvider } from "@/components/ui/sidebar";

const Index = () => {
  const { selectedNodeId } = useGraphStore();
  const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(false);

  // "mainTab" determines whether to show UploadPanel or GraphCanvas
  const [mainTab, setMainTab] = useState<"upload" | "graph">("graph");

  React.useEffect(() => {
    if (selectedNodeId) setSettingsSidebarOpen(true);
    else setSettingsSidebarOpen(false);
  }, [selectedNodeId]);

  return (
    <IconRegistryProvider>
      <div className="bg-background min-h-screen w-full flex flex-col">
        {/* Header */}
        <header className="w-full flex items-center gap-4 px-6 py-4 border-b border-border shadow-sm bg-card z-20">
          <h1 className="text-2xl font-bold tracking-wide text-primary">
            Graph Visualization UI
          </h1>
          <ThemeToggle />
        </header>
        {/* Tabs for Upload & Explore / Graph */}
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
          {/* Wrap this row in SidebarProvider so all sidebar children work */}
          <SidebarProvider>
            <div className="flex-1 flex flex-row w-full min-h-0 max-h-[calc(100vh-70px)] overflow-hidden">
              {/* Main Section (Tab content) */}
              <main className="flex-1 flex flex-col pl-7 pr-2 pt-6 pb-0 max-w-[calc(100vw-370px)]">
                <TabsContent value="upload" className="p-0 h-full w-full">
                  <UploadPanel />
                </TabsContent>
                <TabsContent value="graph" className="p-0 h-full w-full">
                  {/* SWAP: Old GraphCanvas -> New GraphD3Canvas */}
                  <GraphD3Canvas />
                </TabsContent>
              </main>
              {/* Inspector Panel and Sidebar stay always visible */}
              <InspectorPanel />
              <NodeSettingsSidebar
                open={Boolean(selectedNodeId && settingsSidebarOpen)}
                onClose={() => setSettingsSidebarOpen(false)}
              />
            </div>
          </SidebarProvider>
        </Tabs>
      </div>
    </IconRegistryProvider>
  );
};

export default Index;
