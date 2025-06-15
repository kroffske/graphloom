
import React, { useEffect } from "react";
import GraphD3NodeMount from "./GraphD3NodeMount";

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
    simNodes.forEach((n) => {
      const mountPoint = document.getElementById(`d3-node-${n.id}`);
      if (mountPoint) {
        import("react-dom/client").then((ReactDOMClient) => {
          ReactDOMClient.createRoot(mountPoint).render(
            <GraphD3NodeMount
              node={n}
              hiddenNodeIds={hiddenNodeIds}
              setHiddenNodeIds={setHiddenNodeIds}
              setContextNodeId={setContextNodeId}
            />
          );
        });
      }
    });
  }, [simNodes, hiddenNodeIds, setHiddenNodeIds, setContextNodeId]);

  // SVG layer for nodes, should be empty; D3 draws the circles and foreignObjects.
  // Actual nodes are rendered by D3, this is just a group mount.
  return <g ref={nodeGroupRef} />;
};

export default GraphD3NodeLayer;
