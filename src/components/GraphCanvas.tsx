
import React, { useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
} from "@xyflow/react";
import { useGraphStore } from "@/state/useGraphStore";
import { useGraphLogic } from "@/hooks/useGraphLogic";
import AttributeTooltip from "./AttributeTooltip";
import GraphNodeBox from "./GraphNodeBox";

const getNodeColor = (type: string) => {
  const palette: Record<string, string> = {
    entity: "#2563eb",
    process: "#059669",
    "data-store": "#a21caf",
    event: "#eab308",
    decision: "#ef4444",
    "external-system": "#3b82f6",
  };
  return palette[type] || "#64748b";
};

const GraphCanvas = () => {
  const { rfNodes, rfEdges, onNodesChange, onEdgesChange, onConnect, onNodeClick } =
    useGraphLogic();
  const { nodes: storeNodes, selectNode } = useGraphStore();

  // Local state for hovered node for tooltip
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);
  const hoveredNode = storeNodes.find((n) => n.id === hoveredNodeId);

  // NodeTypes: now the actual React component is GraphNodeBox,
  // so we re-use it for each node in the flow
  const nodeTypes = useMemo(
    () => ({
      custom: ({ id, data, selected }: any) => (
        <div
          onMouseEnter={() => setHoveredNodeId(data.nodeId)}
          onMouseLeave={() => setHoveredNodeId(null)}
        >
          <GraphNodeBox
            nodeId={data.nodeId}
            selected={selected}
            onSelect={selectNode}
          />
        </div>
      ),
    }),
    [selectNode]
  );

  return (
    <div className="relative w-full h-[70vh] bg-background border rounded-lg overflow-hidden shadow-lg">
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
      <AttributeTooltip node={hoveredNode} />
    </div>
  );
};

export default GraphCanvas;
