import React, { useEffect, useRef } from 'react';
import { useGraphPortal } from './GraphPortalProvider';
import { GraphNode } from '@/types/graph.types';
import GraphD3NodeMount from './GraphD3NodeMount';

interface GraphNodePortalProps {
  node: GraphNode;
  hiddenNodeIds: Set<string>;
  setHiddenNodeIds: (ids: Set<string>) => void;
  setContextNodeId: (id: string | null) => void;
}

export const GraphNodePortal: React.FC<GraphNodePortalProps> = ({
  node,
  hiddenNodeIds,
  setHiddenNodeIds,
  setContextNodeId,
}) => {
  const { registerPortal, unregisterPortal } = useGraphPortal();
  const elementRef = useRef<React.ReactElement | null>(null);

  // Create the element once and reuse it
  if (!elementRef.current) {
    elementRef.current = (
      <GraphD3NodeMount
        node={node}
        hiddenNodeIds={hiddenNodeIds}
        setHiddenNodeIds={setHiddenNodeIds}
        setContextNodeId={setContextNodeId}
      />
    );
  }

  useEffect(() => {
    registerPortal(node.id, elementRef.current!, 'node');
    
    return () => {
      unregisterPortal(node.id);
    };
  }, [node.id, registerPortal, unregisterPortal]);

  // Update the element if props change
  useEffect(() => {
    elementRef.current = (
      <GraphD3NodeMount
        node={node}
        hiddenNodeIds={hiddenNodeIds}
        setHiddenNodeIds={setHiddenNodeIds}
        setContextNodeId={setContextNodeId}
      />
    );
    registerPortal(node.id, elementRef.current, 'node');
  }, [node, hiddenNodeIds, setHiddenNodeIds, setContextNodeId, registerPortal]);

  // This component doesn't render anything directly
  return null;
};