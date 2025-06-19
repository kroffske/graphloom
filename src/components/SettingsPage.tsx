import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppearanceSettingsSection } from './sidebar/AppearanceSettingsSection';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Palette, Settings2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="appearance" className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="flex-1 mt-6">
          <ScrollArea className="h-full">
            <div className="space-y-6 pr-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Appearance Settings</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Customize the visual appearance of your graph, including colors, sizes, and styles for nodes and edges.
                </p>
              </div>
              
              <AppearanceSettingsSection />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};