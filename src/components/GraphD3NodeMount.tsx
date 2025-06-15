
import React from "react";
import GraphD3Node from "./GraphD3Node";
import GraphNodeContextMenu from "./GraphNodeContextMenu";
import { useGraphStore } from "@/state/useGraphStore";

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
}) => {
  // Access all nodes and edges from the store for neighbours
  const { edges, showNode, selectNode } = useGraphStore();

  // Hide current node
  const onHide = () => {
    setHiddenNodeIds(new Set([...hiddenNodeIds, node.id]));
  };

  // Unhide direct neighbours of this node
  const onUnhideNeighbours = () => {
    // node.id, then edges => find all adjacent node IDs, and unhide them
    const neighbours: string[] = [];
    edges.forEach((e) => {
      if (e.source === node.id && hiddenNodeIds.has(e.target)) neighbours.push(e.target);
      if (e.target === node.id && hiddenNodeIds.has(e.source)) neighbours.push(e.source);
    });
    if (neighbours.length > 0) {
      const newSet = new Set(hiddenNodeIds);
      neighbours.forEach((id) => newSet.delete(id));
      setHiddenNodeIds(newSet);
    }
  };

  // Show the inspector panel/details for this node
  const onShowDetails = () => {
    selectNode(node.id);
    setContextNodeId(null);
  };

  return (
    <GraphNodeContextMenu
      nodeId={node.id}
      isHidden={!!hiddenNodeIds.has(node.id)}
      onHide={onHide}
      onUnhideNeighbours={onUnhideNeighbours}
      onShowDetails={onShowDetails}
    >
      <GraphD3Node node={node} selected={false} />
    </GraphNodeContextMenu>
  );
};

export default GraphD3NodeMount;
