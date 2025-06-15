
import React, { useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
} from "@xyflow/react";
import { getNodeColor, getNodeTypes } from "./GraphConfig";
import { useGraphStore, GraphStore } from "@/state/useGraphStore";

type GraphRendererProps = {
  rfNodes: any[];
  rfEdges: any[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  onNodeClick: any;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
};

const GraphRenderer: React.FC<GraphRendererProps> = ({
  rfNodes,
  rfEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  hoveredNodeId,
  setHoveredNodeId,
}) => {
  const { nodes: storeNodes, selectNode } = useGraphStore(
    (state: GraphStore) => ({
      nodes: state.nodes,
      selectNode: state.selectNode,
    })
  );

  const nodeTypes = useMemo(
    () => getNodeTypes(setHoveredNodeId, selectNode),
    [setHoveredNodeId, selectNode]
  );

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      elementsSelectable
      nodesDraggable
      nodesConnectable
      panOnDrag
      zoomOnScroll
      fitView
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      minZoom={0.2}
      maxZoom={2}
    >
      <MiniMap
        nodeColor={(n) =>
          getNodeColor(
            storeNodes.find((x) => x.id === n.id)?.type || ""
          )
        }
      />
      <Background gap={14} size={1} color="#e5e7eb" />
      <Controls />
    </ReactFlow>
  );
};

export default GraphRenderer;
