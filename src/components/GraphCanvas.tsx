
import React, { useMemo, useCallback, useEffect } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
} from "@xyflow/react";
import { useGraphStore } from "@/state/useGraphStore";
import { useIconRegistry } from "./IconRegistry";
import AttributeTooltip from "./AttributeTooltip";

type RFNode = Node & { data: { nodeId: string } };

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

const getEdgeColor = (type?: string) => {
  const palette: Record<string, string> = {
    default: "#64748b",
    dependency: "#ef4444",
    produces: "#059669",
    // fallback for anything else
  };
  return palette[type || "default"] || "#9089fc";
};

const GraphCanvas = () => {
  const { nodes: storeNodes, edges: storeEdges, setNodes, setEdges, selectNode } = useGraphStore();
  const iconRegistry = useIconRegistry();

  // Map store nodes to React Flow nodes, include known positions
  const rfNodesDefault = useMemo<RFNode[]>(
    () =>
      storeNodes.map((n) => ({
        id: n.id,
        position: { x: n.x ?? Math.random() * 500, y: n.y ?? Math.random() * 400 },
        type: "custom",
        data: { nodeId: n.id },
        selectable: true,
      })),
    [storeNodes]
  );
  const rfEdgesDefault = useMemo<Edge[]>(
    () =>
      storeEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "default",
        style: { stroke: getEdgeColor(e.type), strokeWidth: 2 },
      })),
    [storeEdges]
  );

  // Manage local state for React Flow (so we can drag, plot, etc)
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(rfNodesDefault);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(rfEdgesDefault);

  // Sync from global Zustand whenever store arrays change for hard reloads/upload
  useEffect(() => {
    setRfNodes(rfNodesDefault);
    setRfEdges(rfEdgesDefault);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rfNodesDefault, rfEdgesDefault]);

  // When nodes are changed (dragged etc), update in store too!
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
    setTimeout(() => {
      setNodes(
        rfNodes.map((n) => {
          // We'll use last changes, or fallback to current state
          const curChange = changes.find((c: any) => c.id === n.id);
          return {
            ...(storeNodes.find((m) => m.id === n.id) || {
              id: n.id,
              type: "entity",
              label: n.id,
              attributes: {},
            }),
            x: curChange?.position?.x ?? n.position.x,
            y: curChange?.position?.y ?? n.position.y,
          };
        })
      );
    });
    // eslint-disable-next-line
  }, [onNodesChange, setNodes, rfNodes, storeNodes]);

  // Drag edges onto nodes to create connections
  const handleConnect = useCallback(
    (connection: Edge | Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: `e${Date.now()}`,
        type: "default",
        style: { stroke: "#64748b", strokeWidth: 2 },
      };
      setRfEdges((eds) => addEdge(newEdge, eds));
      // Also update the global store (Zustand)
      setEdges([
        ...rfEdges,
        {
          id: newEdge.id,
          source: String(newEdge.source),
          target: String(newEdge.target),
          type: "default",
        },
      ]);
    },
    [setRfEdges, setEdges, rfEdges]
  );

  // Local state for hover, for tooltips
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);

  // Node renderer
  const nodeTypes = useMemo(
    () => ({
      custom: ({ id, data, selected }: any) => {
        const node = storeNodes.find((n) => n.id === data.nodeId);
        const Icon = node ? iconRegistry[node.type] : null;
        return (
          <div
            className={`flex flex-col items-center px-3 py-2 rounded-lg shadow-md cursor-pointer outline-none border-2  ${selected ? "border-primary ring-2 ring-blue-300" : "border-transparent"} bg-white dark:bg-card`}
            tabIndex={0}
            role="button"
            aria-label={node?.label || "Node"}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") selectNode(node?.id ?? null);
            }}
            onMouseEnter={() => setHoveredNodeId(node?.id ?? null)}
            onMouseLeave={() => setHoveredNodeId(null)}
            onClick={() => selectNode(node?.id ?? null)}
            style={{ minWidth: 64, minHeight: 64, outline: "none" }}
          >
            {Icon && (
              <Icon
                className="w-8 h-8 mb-1"
                aria-label={node.type}
                filled={false}
              />
            )}
            <span className="text-xs font-medium truncate max-w-[80px] text-foreground">{node?.label ?? ""}</span>
          </div>
        );
      },
    }),
    [storeNodes, iconRegistry, selectNode]
  );

  // Tooltip logic (independent floating card)
  const hoveredNode = storeNodes.find((n) => n.id === hoveredNodeId);

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
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeMouseEnter={(_, n) => setHoveredNodeId(n.id)}
        onNodeMouseLeave={() => setHoveredNodeId(null)}
        onNodeClick={(_, n) => selectNode(n.id)}
        minZoom={0.2}
        maxZoom={2}
      >
        <MiniMap
          nodeColor={(n) => getNodeColor(storeNodes.find((x) => x.id === n.id)?.type || "")}
        />
        <Background gap={14} size={1} color="#e5e7eb" />
        <Controls />
      </ReactFlow>
      <AttributeTooltip node={hoveredNode} />
    </div>
  );
};

export default GraphCanvas;

