import React from 'react';
import { useGraphStore } from '@/state/useGraphStore';
import { useIconRegistry } from '@/components/IconRegistry';
import NodeSettingsForm from '@/components/NodeSettingsForm';
import EdgeDetailsDisplay from '@/components/EdgeDetailsDisplay';
import EdgeSettingsForm from '@/components/EdgeSettingsForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Settings } from 'lucide-react';

export const DetailsSection: React.FC = () => {
  const {
    selectedNodeId,
    selectedEdgeId,
    nodes,
    edges,
  } = useGraphStore();
  const iconRegistry = useIconRegistry();

  // Show nothing if nothing is selected
  if (!selectedNodeId && !selectedEdgeId) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">Select a node or edge to see details</p>
      </div>
    );
  }

  // Node selected
  if (selectedNodeId) {
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;
    const Icon = iconRegistry[node.appearance?.icon || node.type] || iconRegistry[node.type];

    return (
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details" className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            Details
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <Icon filled className="w-8 h-8" aria-label={node.type} />
            )}
            <span className="font-bold text-lg">{node.label}</span>
          </div>
          
          <div>
            <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">Attributes</div>
            <dl className="grid grid-cols-2 gap-x-2 gap-y-1">
              {Object.entries(node.attributes).map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt className="font-semibold text-xs text-muted-foreground">{k}</dt>
                  <dd className="text-xs text-foreground truncate">{String(v)}</dd>
                </React.Fragment>
              ))}
            </dl>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <NodeSettingsForm node={node} />
        </TabsContent>
      </Tabs>
    );
  }

  // Edge selected
  if (selectedEdgeId) {
    const edge = edges.find((e) => e.id === selectedEdgeId);
    if (!edge) return null;

    return (
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details" className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            Details
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <EdgeDetailsDisplay edge={edge} />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <EdgeSettingsForm edge={edge} />
        </TabsContent>
      </Tabs>
    );
  }

  return null;
};