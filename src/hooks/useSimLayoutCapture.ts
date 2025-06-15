
import { useRef, useCallback } from "react";

/**
 * Hook for capturing and recalling D3 simulation node positions as { id: {x, y} }
 * Used to preserve layout when switching to manual mode.
 */
export function useSimLayoutCapture() {
  // Ref: Stores last simulation { id: { x, y } }
  const lastSimPositions = useRef<Record<string, { x: number; y: number }>>({});

  // Call with D3 simulation node array
  const capturePositions = useCallback((simNodes: any[]) => {
    const pos: Record<string, { x: number; y: number }> = {};
    simNodes.forEach((n: any) => {
      if (typeof n.id === "string" && typeof n.x === "number" && typeof n.y === "number") {
        pos[n.id] = { x: n.x, y: n.y };
      }
    });
    lastSimPositions.current = pos;
  }, []);

  // Get latest positions; optionally filter to a specific set of ids
  const getPositions = useCallback((ids?: string[]) => {
    if (!ids) return { ...lastSimPositions.current };
    const copy: Record<string, { x: number; y: number }> = {};
    ids.forEach((id) => {
      if (lastSimPositions.current[id]) {
        copy[id] = { ...lastSimPositions.current[id] };
      }
    });
    return copy;
  }, []);

  return { capturePositions, getPositions };
}
