import React, { useState } from 'react';
import { useGraphStore } from '@/state/useGraphStore';
import { useIconRegistry } from '@/components/IconRegistry';
import NodeSettingsFormV2 from '@/components/NodeSettingsFormV2';
import EdgeSettingsFormV2 from '@/components/EdgeSettingsFormV2';
import EdgeDetailsDisplay from '@/components/EdgeDetailsDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Palette } from 'lucide-react';

export const DetailsSection: React.FC = () => {
  const {
    selectedNodeId,
    selectedEdgeId,
    nodes,
    edges,
  } = useGraphStore();
  const iconRegistry = useIconRegistry();
  const [activeTab, setActiveTab] = useState<string>('details');

  // Show nothing if nothing is selected
  if (!selectedNodeId && !selectedEdgeId) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">Select a node or edge to view details</p>
      </div>
    );
  }

  // Node selected
  if (selectedNodeId) {
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;
    const Icon = iconRegistry[node.appearance?.icon || node.type] || iconRegistry[node.type];

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details" className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            Details
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1">
            <Palette className="h-3 w-3" />
            Appearance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="flex items-center gap-3 mb-4">
            {Icon && (
              <Icon filled className="w-8 h-8" aria-label={node.type} />
            )}
            <div>
              <h3 className="font-semibold text-lg select-text">{node.label}</h3>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Details</h4>
            <div className="space-y-1">
              {/* Core properties */}
              <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground select-text">id:</span>
                <span className="text-foreground truncate max-w-[60%] select-text cursor-text" title={node.id}>{node.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground select-text">type:</span>
                <span className="text-foreground truncate max-w-[60%] select-text cursor-text" title={node.type}>{node.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground select-text">label:</span>
                <span className="text-foreground truncate max-w-[60%] select-text cursor-text" title={node.label}>{node.label}</span>
              </div>
              
              {/* Visual separator */}
              {Object.keys(node.attributes).length > 0 && <div className="my-2 border-t" />}
              
              {/* Custom attributes */}
              {Object.entries(node.attributes).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground select-text">{key}:</span>
                  <span className="text-foreground truncate max-w-[60%] select-text cursor-text" title={String(value)}>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="appearance" className="mt-4">
          <NodeSettingsFormV2 node={node} />
        </TabsContent>
      </Tabs>
    );
  }

  // Edge selected
  if (selectedEdgeId) {
    const edge = edges.find((e) => e.id === selectedEdgeId);
    if (!edge) return null;

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details" className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            Details
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1">
            <Palette className="h-3 w-3" />
            Appearance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-4">
          <EdgeDetailsDisplay edge={edge} />
        </TabsContent>
        
        <TabsContent value="appearance" className="mt-4">
          <EdgeSettingsFormV2 edge={edge} />
        </TabsContent>
      </Tabs>
    );
  }

  return null;
};