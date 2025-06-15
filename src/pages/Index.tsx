
import React, { useState } from "react";
import { IconRegistryProvider } from "@/components/IconRegistry";
import GraphCanvas from "@/components/GraphCanvas";
import UploadPanel from "@/components/UploadPanel";
import InspectorPanel from "@/components/InspectorPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { useGraphStore } from "@/state/useGraphStore";
import { NodeSettingsSidebar } from "@/components/NodeSettingsSidebar";

const Index = () => {
  const { selectedNodeId } = useGraphStore();
  const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(false);

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
        {/* Content */}
        <div className="flex-1 flex flex-row w-full min-h-0 max-h-[calc(100vh-70px)] overflow-hidden">
          {/* Main Section */}
          <main className="flex-1 flex flex-col pl-7 pr-2 pt-6 pb-0 max-w-[calc(100vw-370px)]">
            <UploadPanel />
            <GraphCanvas />
          </main>
          {/* Inspector Panel */}
          <InspectorPanel />
          {/* Node Settings Sidebar */}
          <NodeSettingsSidebar
            open={Boolean(selectedNodeId && settingsSidebarOpen)}
            onClose={() => setSettingsSidebarOpen(false)}
          />
        </div>
      </div>
    </IconRegistryProvider>
  );
};

export default Index;

