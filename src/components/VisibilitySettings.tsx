import React from 'react';
import { useGraphStore } from '@/state/useGraphStore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export const VisibilitySettings: React.FC = () => {
  const showEdgeLabels = useGraphStore(state => state.showEdgeLabels);
  const toggleEdgeLabels = useGraphStore(state => state.toggleEdgeLabels);
  const showIsolatedNodes = useGraphStore(state => state.showIsolatedNodes);
  const toggleIsolatedNodes = useGraphStore(state => state.toggleIsolatedNodes);
  
  // Calculate isolated nodes count
  const nodes = useGraphStore(state => state.nodes);
  const edges = useGraphStore(state => state.edges);
  
  const isolatedNodesCount = React.useMemo(() => {
    const connectedNodes = new Set<string>();
    edges.forEach(edge => {
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
      connectedNodes.add(sourceId);
      connectedNodes.add(targetId);
    });
    
    return nodes.filter(node => !connectedNodes.has(node.id)).length;
  }, [nodes, edges]);
  
  return (
    <div className="space-y-4 p-4 bg-card border rounded-lg">
      <h3 className="text-sm font-medium">Visibility Settings</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="edge-labels" className="text-sm cursor-pointer">
              Edge Labels
            </Label>
          </div>
          <Switch
            id="edge-labels"
            checked={showEdgeLabels}
            onCheckedChange={toggleEdgeLabels}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Label htmlFor="isolated-nodes" className="text-sm cursor-pointer">
              Isolated Nodes
            </Label>
            <span className="text-xs text-muted-foreground">
              {isolatedNodesCount} nodes with no connections
            </span>
          </div>
          <Switch
            id="isolated-nodes"
            checked={showIsolatedNodes}
            onCheckedChange={toggleIsolatedNodes}
          />
        </div>
      </div>
    </div>
  );
};