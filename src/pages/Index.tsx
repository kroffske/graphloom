
import React, { useState } from "react";
import { IconRegistryProvider } from "@/components/IconRegistry";
import GraphD3Canvas from "@/components/GraphD3Canvas";
import UploadPanel from "@/components/UploadPanel";
import InspectorPanel from "@/components/InspectorPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SidebarProvider } from "@/components/ui/sidebar";

const Index = () => {
  // Only "upload" and "graph"
  const [mainTab, setMainTab] = useState<"upload" | "graph">("graph");

  return (
    <IconRegistryProvider>
      <div className="bg-background min-h-screen w-full flex flex-col">
        {/* Header */}
        <header className="w-full flex items-center gap-4 px-6 py-4 border-b border-border shadow-sm bg-card z-20 relative">
          <h1 className="text-2xl font-bold tracking-wide text-primary">
            Graph Visualization UI
          </h1>
          <ThemeToggle />
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
          <SidebarProvider>
            <div className="flex-1 flex flex-row w-full min-h-0 max-h-[calc(100vh-70px)] overflow-hidden">
              <main className="flex-1 flex flex-col pl-7 pr-2 pt-6 pb-0 max-w-[calc(100vw-370px)]">
                <TabsContent value="upload" className="p-0 h-full w-full">
                  <UploadPanel />
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
