
import React from "react";
import GraphD3Node from "./GraphD3Node";
import GraphNodeContextMenu from "./GraphNodeContextMenu";

type GraphD3NodeMountProps = {
  node: any;
  hiddenNodeIds: Set<string>;
  setHiddenNodeIds: (s: Set<string>) => void;
  setContextNodeId: (id: string | null) => void;
};

const GraphD3NodeMount: React.FC<GraphD3NodeMountProps> = ({
  node,
  hiddenNodeIds,
  setHiddenNodeIds,
  setContextNodeId,
}) => (
  <GraphNodeContextMenu
    nodeId={node.id}
    isHidden={!!hiddenNodeIds.has(node.id)}
    onHide={() => setHiddenNodeIds(new Set([...hiddenNodeIds, node.id]))}
    onExpand={() => {
      const s = new Set(hiddenNodeIds);
      s.delete(node.id);
      setHiddenNodeIds(new Set(s));
    }}
  >
    <GraphD3Node node={node} selected={false} />
  </GraphNodeContextMenu>
);

export default GraphD3NodeMount;
