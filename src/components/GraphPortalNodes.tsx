import React from 'react';
import { GraphNodePortal } from './GraphNodePortal';
import { GraphNode } from '@/types/graph';

interface GraphPortalNodesProps {
  nodes: GraphNode[];
  hiddenNodeIds: Set<string>;
  setHiddenNodeIds: (ids: Set<string>) => void;
  setContextNodeId: (id: string | null) => void;
}

/**
 * Container component that renders all graph nodes via portals.
 * This component should be rendered inside GraphPortalProvider.
 */
export const GraphPortalNodes: React.FC<GraphPortalNodesProps> = ({
  nodes,
  hiddenNodeIds,
  setHiddenNodeIds,
  setContextNodeId,
}) => {
  return (
    <>
      {nodes.map((node) => (
        <GraphNodePortal
          key={node.id}
          node={node}
          hiddenNodeIds={hiddenNodeIds}
          setHiddenNodeIds={setHiddenNodeIds}
          setContextNodeId={setContextNodeId}
        />
      ))}
    </>
  );
};