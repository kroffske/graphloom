
import React, { useState } from "react";
import { IconRegistryProvider } from "@/components/IconRegistry";
import { GraphCanvasV2 } from "@/components/GraphCanvasV2";
import UploadPanel from "@/components/UploadPanel";
import InspectorPanel from "@/components/InspectorPanel";
import { Header } from "@/components/Header";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CollapsibleRightSidebar } from "@/components/CollapsibleRightSidebar";
import { LayoutSettingsSection } from "@/components/sidebar/LayoutSettingsSection";
import { TestDataSection } from "@/components/sidebar/TestDataSection";
import { AppearanceSettingsSection } from "@/components/sidebar/AppearanceSettingsSection";
import { Layout, Palette, Database } from "lucide-react";

const Index = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const sidebarSections = [
    {
      id: 'layout',
      title: 'Layout',
      icon: <Layout className="h-4 w-4" />,
      content: <LayoutSettingsSection />,
      defaultOpen: true
    },
    {
      id: 'test-data',
      title: 'Test Data',
      icon: <Database className="h-4 w-4" />,
      content: <TestDataSection />,
      defaultOpen: true
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: <Palette className="h-4 w-4" />,
      content: <AppearanceSettingsSection />,
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
            <main className="flex-1 flex flex-col p-2">
              <div className="flex-1 min-h-0 overflow-hidden">
                <GraphCanvasV2 />
              </div>
            </main>
            
            {/* Right sidebar area */}
            <div className="flex">
              <InspectorPanel />
              <CollapsibleRightSidebar sections={sidebarSections} />
            </div>
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
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {/* Settings content will go here */}
              <p className="text-muted-foreground">Settings panel coming soon...</p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </IconRegistryProvider>
  );
};

export default Index;
