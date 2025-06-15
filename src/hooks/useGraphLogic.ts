import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeChange,
} from "@xyflow/react";
import { useGraphStore } from "@/state/useGraphStore";
import { shallow } from "zustand/shallow";

/**
 * Manages all logic for graph state, including synchronization and node hover handling.
 */
export function useGraphLogic() {
  // Zustand store (source of truth for CSV upload, but not for interactive graph anymore)
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes,
    setEdges,
    selectNode,
  } = useGraphStore(
    (state) => ({
      nodes: state.nodes,
      edges: state.edges,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      selectNode: state.selectNode,
    }),
    shallow
  );

  // Local state for hovered node (for tooltip)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Transform Zustand nodes/edges into React Flow-compatible nodes (on first load)
  const rfNodesInitial = useMemo<Node[]>(
    () =>
      storeNodes.map((n) => ({
        id: n.id,
        position: { x: n.x ?? Math.random() * 500, y: n.y ?? Math.random() * 400 },
        type: "custom",
        data: { nodeId: n.id },
      })),
    // Only on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const rfEdgesInitial = useMemo<Edge[]>(
    () =>
      storeEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "default",
        style: { stroke: "#64748b", strokeWidth: 2 },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // React Flow manages nodes/edges after initialization!
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(rfNodesInitial);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(rfEdgesInitial);

  // Track if we've synced initial data from Zustand already
  const initialized = useRef(false);

  // Hydrate RF state ONLY ONCE from Zustand
  useEffect(() => {
    if (!initialized.current && storeNodes.length && storeEdges.length) {
      setRfNodes(
        storeNodes.map((n) => ({
          id: n.id,
          position: { x: n.x ?? Math.random() * 500, y: n.y ?? Math.random() * 400 },
          type: "custom",
          data: { nodeId: n.id },
        }))
      );
      setRfEdges(
        storeEdges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: "default",
          style: { stroke: "#64748b", strokeWidth: 2 },
        }))
      );
      initialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeNodes, storeEdges]);

  // On node drag or change: sync positions to Zustand
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      // We only update the store when the dragging stops to avoid too many updates
      const positionChanges = changes.filter(
        (change) =>
          change.type === "position" &&
          change.position &&
          change.dragging === false
      );

      if (positionChanges.length > 0) {
        const changeMap = new Map(
          positionChanges.map((c) => [c.id, c.position])
        );

        setNodes((currentStoreNodes) =>
          currentStoreNodes.map((node) => {
            if (changeMap.has(node.id)) {
              const newPosition = changeMap.get(node.id)!;
              return {
                ...node,
                x: newPosition.x,
                y: newPosition.y,
              };
            }
            return node;
          })
        );
      }
    },
    [onNodesChange, setNodes]
  );

  // On edge create: add to both RF and Zustand
  const handleConnect = useCallback(
    (connection: Edge | Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: `e${Date.now()}`,
        type: "default",
        style: { stroke: "#64748b", strokeWidth: 2 },
      };
      setRfEdges((eds) => addEdge(newEdge, eds));
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

  // Select node on click
  const onNodeClick = useCallback(
    (_: any, n: Node) => {
      selectNode(n.id);
    },
    [selectNode]
  );

  return {
    rfNodes,
    rfEdges,
    setRfNodes,
    setRfEdges,
    onNodesChange: handleNodesChange,
    onEdgesChange,
    onConnect: handleConnect,
    onNodeClick,
    hoveredNodeId,
    setHoveredNodeId,
  };
}
