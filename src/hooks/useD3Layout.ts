
import { useMemo } from "react";
import { d3LayoutForce } from "@/utils/d3LayoutForce";
import { d3LayoutCircle } from "@/utils/d3LayoutCircle";
import { d3LayoutHierarchy } from "@/utils/d3LayoutHierarchy";

const WIDTH = 900;
const HEIGHT = 530;
const NODE_RADIUS = 36;

// Helper: return equally spaced fallback positions for manual mode.
function getFallbackXY(idx: number, total: number) {
  const perRow = Math.ceil(Math.sqrt(total));
  const spacingX = WIDTH / (perRow + 1);
  const spacingY = HEIGHT / (perRow + 1);
  const x = spacingX * (1 + (idx % perRow));
  const y = spacingY * (1 + Math.floor(idx / perRow));
  return { x, y };
}

export function useD3Layout(layoutMode: "force" | "circle" | "hierarchy" | "manual", nodes: any[], edges: any[], manualPositions: Record<string, { x: number; y: number }>) {
  return useMemo(() => {
    if (layoutMode === "force") {
      return d3LayoutForce(nodes, edges, NODE_RADIUS, WIDTH, HEIGHT);
    }
    if (layoutMode === "circle") {
      return d3LayoutCircle(nodes, edges, WIDTH, HEIGHT);
    }
    if (layoutMode === "hierarchy") {
      return d3LayoutHierarchy(nodes, edges, WIDTH, HEIGHT);
    }
    // Manual
    const total = nodes.length;
    const simNodes = nodes.map((n, i) => {
      if (manualPositions[n.id]) {
        return { ...n, ...manualPositions[n.id] };
      } else if (typeof n.x === "number" && typeof n.y === "number") {
        return { ...n, x: n.x, y: n.y };
      } else {
        const xy = getFallbackXY(i, total);
        return { ...n, ...xy };
      }
    });
    const simEdges = edges.map((e) => ({ ...e }));
    return {
      simulation: { on: () => {}, stop: () => {} },
      simNodes,
      simEdges,
    };
  }, [layoutMode, nodes, edges, manualPositions]);
}

