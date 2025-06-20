import React from 'react';
import { useGraphStore } from '@/state/useGraphStore';
import NodeSettingsFormV2 from '@/components/NodeSettingsFormV2';
import EdgeSettingsFormV2 from '@/components/EdgeSettingsFormV2';

export const DetailsSection: React.FC = () => {
  const {
    selectedNodeId,
    selectedEdgeId,
    nodes,
    edges,
  } = useGraphStore();

  // Show nothing if nothing is selected
  if (!selectedNodeId && !selectedEdgeId) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">Select a node or edge to customize appearance</p>
      </div>
    );
  }

  // Node selected
  if (selectedNodeId) {
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;

    return (
      <div className="space-y-4">
        <NodeSettingsFormV2 node={node} />
      </div>
    );
  }

  // Edge selected
  if (selectedEdgeId) {
    const edge = edges.find((e) => e.id === selectedEdgeId);
    if (!edge) return null;

    return (
      <div className="space-y-4">
        <EdgeSettingsFormV2 edge={edge} />
      </div>
    );
  }

  return null;
};