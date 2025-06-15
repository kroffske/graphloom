
import { useCallback, useRef } from "react";
import { useGraphStore, GraphNode, GraphEdge } from "@/state/useGraphStore";
import { diffGraphNodes, diffGraphEdges } from "@/utils/graphDiffing";

/**
 * Custom hook encapsulating all D3 graph layout and differential state logic,
 * including preservation and incremental updates of positions.
 */
export function useD3GraphState() {
  // Zustand state & mutators
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setManualPosition,
    manualPositions,
    incrementalUpdateNodes,
    incrementalUpdateEdges,
    // Expose setter for all manual positions
  } = useGraphStore();

  // Add: bulk manual positions setter
  const setManualPositions = useCallback(
    (positions: Record<string, { x: number; y: number }>) => {
      // This setter is not in the store yet, so simulate by updating each
      Object.entries(positions).forEach(([id, pos]) => setManualPosition(id, pos));
    },
    [setManualPosition]
  );

  // Cache: Used to memorize last states for diffing
  const lastNodesRef = useRef<GraphNode[]>([]);
  const lastEdgesRef = useRef<GraphEdge[]>([]);

  // Differential node update
  const updateNodes = useCallback(
    (incoming: GraphNode[]) => {
      // Reuse x/y if unchanged
      const incomingWithPreservedXY = incoming.map(n => {
        const existing = nodes.find(e => e.id === n.id);
        // Copy manual position if set, else latest x/y
        if (existing) {
          const manual = manualPositions[n.id];
          return {
            ...n,
            ...(manual || { x: existing.x, y: existing.y }),
          };
        }
        return n;
      });

      // Only update changed/missing
      const diffs = diffGraphNodes(lastNodesRef.current, incomingWithPreservedXY);
      if (diffs.length > 0) {
        incrementalUpdateNodes(diffs);
        lastNodesRef.current = incomingWithPreservedXY;
      }
    },
    [nodes, manualPositions, incrementalUpdateNodes]
  );

  // Differential edge update
  const updateEdges = useCallback(
    (incoming: GraphEdge[]) => {
      const diffs = diffGraphEdges(lastEdgesRef.current, incoming);
      if (diffs.length > 0) {
        incrementalUpdateEdges(diffs);
        lastEdgesRef.current = incoming;
      }
    },
    [incrementalUpdateEdges]
  );

  // State clear/persist helpers
  const clearManualPositions = useCallback(() => {
    setNodes(nodes.map(n => ({ ...n, x: undefined, y: undefined })));
  }, [nodes, setNodes]);

  const saveManualPosition = useCallback(
    (nodeId: string, pos: { x: number; y: number }) => {
      setManualPosition(nodeId, pos);
    },
    [setManualPosition]
  );

  return {
    nodes,
    edges,
    updateNodes,
    updateEdges,
    clearManualPositions,
    saveManualPosition,
    manualPositions,
    setManualPositions, // new exposed
  };
}

