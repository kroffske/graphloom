
import React, { useEffect, useRef } from "react";
import GraphD3NodeMount from "./GraphD3NodeMount";

// Store roots at module level to persist across re-renders
const nodeLayerRootsMap = new Map<string, any>();

type GraphD3NodeLayerProps = {
  simNodes: any[];
  nodeGroupRef: React.MutableRefObject<any>;
  hiddenNodeIds: Set<string>;
  setHiddenNodeIds: (s: Set<string>) => void;
  setContextNodeId: (id: string | null) => void;
  setHoveredNodeId: (id: string | null) => void;
  onNodeKeydown?: (event: any, d: any) => void;
};

const NODE_RADIUS = 36;

const GraphD3NodeLayer: React.FC<GraphD3NodeLayerProps> = ({
  simNodes,
  nodeGroupRef,
  hiddenNodeIds,
  setHiddenNodeIds,
  setContextNodeId,
  setHoveredNodeId,
  onNodeKeydown,
}) => {
  // Mount React nodes into portals after initial render.
  useEffect(() => {
    // Clean up roots for nodes that no longer exist
    const currentNodeIds = new Set(simNodes.map(n => n.id));
    nodeLayerRootsMap.forEach((root, id) => {
      if (!currentNodeIds.has(id)) {
        try {
          root.unmount();
        } catch (e) {
          // Ignore errors
        }
        nodeLayerRootsMap.delete(id);
      }
    });
    
    // Mount or update nodes
    simNodes.forEach((n) => {
      const mountPoint = document.getElementById(`d3-node-${n.id}`);
      if (mountPoint) {
        import("react-dom/client").then((ReactDOMClient) => {
          let root = nodeLayerRootsMap.get(n.id);
          
          if (!root) {
            try {
              root = ReactDOMClient.createRoot(mountPoint);
              nodeLayerRootsMap.set(n.id, root);
            } catch (e) {
              console.warn(`Failed to create root for node ${n.id}:`, e);
              return;
            }
          }
          
          try {
            root.render(
              <GraphD3NodeMount
                node={n}
                hiddenNodeIds={hiddenNodeIds}
                setHiddenNodeIds={setHiddenNodeIds}
                setContextNodeId={setContextNodeId}
              />
            );
          } catch (e) {
            console.warn(`Failed to render node ${n.id}:`, e);
            nodeLayerRootsMap.delete(n.id);
          }
        });
      }
    });
    
    // Cleanup on unmount
    return () => {
      nodeLayerRootsMap.forEach((root) => {
        try {
          root.unmount();
        } catch (e) {
          // Ignore errors
        }
      });
      nodeLayerRootsMap.clear();
    };
  }, [simNodes, hiddenNodeIds, setHiddenNodeIds, setContextNodeId]);

  // SVG layer for nodes, should be empty; D3 draws the circles and foreignObjects.
  // Actual nodes are rendered by D3, this is just a group mount.
  return <g ref={nodeGroupRef} />;
};

export default GraphD3NodeLayer;
