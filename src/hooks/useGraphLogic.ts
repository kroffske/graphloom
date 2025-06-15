import { useEffect, useMemo, useRef, useCallback } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
} from "@xyflow/react";
import { useGraphStore } from "@/state/useGraphStore";

export function useGraphLogic() {
  // Zustand store (source of truth for CSV upload, but not for interactive graph anymore)
  const { nodes: storeNodes, edges: storeEdges, setNodes, setEdges, selectNode } = useGraphStore();

  // Transform Zustand nodes/edges into React Flow-compatible nodes (for initial load only)
  const rfNodesInitial = useMemo<Node[]>(
    () =>
      storeNodes.map((n) => ({
        id: n.id,
        position: { x: n.x ?? Math.random() * 500, y: n.y ?? Math.random() * 400 },
        type: "custom",
        data: { nodeId: n.id },
      })),
    // Only uses on initial mount (don't keep sync here)
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

  // Track whether we've synced initial data from Zustand already
  const initialized = useRef(false);

  // Hydrate RF state ONLY ONCE from Zustand (when files are uploaded, reload the page to update graph)
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

  // On node drag or position change: sync positions to Zustand
  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      setTimeout(() => {
        setNodes(
          rfNodes.map((n) => {
            // Store last known positions on Zustand node objects
            const srcData = storeNodes.find((node) => node.id === n.id);
            return {
              ...(srcData || { id: n.id, type: "entity", label: n.id, attributes: {} }),
              x: n.position.x,
              y: n.position.y,
            };
          })
        );
      });
    },
    [onNodesChange, setNodes, rfNodes, storeNodes]
  );

  // On edge manip: add to both RF and Zustand
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

  // Select node logic
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
  };
}
