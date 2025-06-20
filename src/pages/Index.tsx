
import React, { useState } from "react";
import { IconRegistryProvider } from "@/components/IconRegistry";
import { GraphCanvasV2 } from "@/components/GraphCanvasV2";
import UploadPanel from "@/components/UploadPanel";
import { Header } from "@/components/Header";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CollapsibleRightSidebar } from "@/components/CollapsibleRightSidebar";
import { LayoutSettingsSection } from "@/components/sidebar/LayoutSettingsSection";
import { TestDataSection } from "@/components/sidebar/TestDataSection";
import { DetailsSection } from "@/components/sidebar/DetailsSection";
import { SettingsPage } from "@/components/SettingsPage";
import { useGraphStore } from "@/state/useGraphStore";
import { Layout, Database, Palette } from "lucide-react";

const Index = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { selectedNodeId, selectedEdgeId } = useGraphStore();
  
  // Show details section when something is selected
  const hasSelection = selectedNodeId || selectedEdgeId;

  const sidebarSections = [
    // Only show details section when something is selected
    ...(hasSelection ? [{
      id: 'appearance',
      title: 'Appearance',
      icon: <Palette className="h-4 w-4" />,
      content: <DetailsSection />,
      defaultOpen: true
    }] : []),
    {
      id: 'layout',
      title: 'Layout',
      icon: <Layout className="h-4 w-4" />,
      content: <LayoutSettingsSection />,
      defaultOpen: !hasSelection
    },
    {
      id: 'test-data',
      title: 'Test Data',
      icon: <Database className="h-4 w-4" />,
      content: <TestDataSection />,
      defaultOpen: false
    }
  ];

  return (
    <IconRegistryProvider>
      <div className="bg-background min-h-screen w-full flex flex-col">
        <Header 
          onUploadClick={() => setUploadOpen(true)}
          onSettingsClick={() => setSettingsOpen(true)}
        />
        
        <SidebarProvider>
          <div className="flex-1 flex flex-row w-full min-h-0 overflow-hidden">
            <main className="flex-1 flex flex-col">
              <div className="flex-1 min-h-0 overflow-hidden">
                <GraphCanvasV2 />
              </div>
            </main>
            
            {/* Right sidebar */}
            <CollapsibleRightSidebar sections={sidebarSections} />
          </div>
        </SidebarProvider>

        {/* Upload Sheet */}
        <Sheet open={uploadOpen} onOpenChange={setUploadOpen}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Upload & Explore</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <UploadPanel />
            </div>
          </SheetContent>
        </Sheet>

        {/* Settings Sheet */}
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetContent className="w-[600px] sm:w-[720px]">
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <div className="mt-6 h-[calc(100vh-8rem)]">
              <SettingsPage />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </IconRegistryProvider>
  );
};

export default Index;
