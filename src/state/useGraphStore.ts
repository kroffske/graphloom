import { create } from "zustand";

// Graph Node & Edge structures (loosely modeled)
export type GraphNode = {
  id: string;
  type: string; // node type, used for icon mapping
  label: string;
  attributes: Record<string, string | number | boolean>;
  x?: number;
  y?: number;
  // Appearance options
  appearance?: {
    icon?: string; // nodeType key
    color?: string; // legacy color/name primary
    size?: number; // px, default 64
    labelField?: string; // key to show (else "label")
    backgroundColor?: string; // New: background color with alpha
    lineColor?: string; // New: border/line color (stroke)
    showIconCircle?: boolean; // New: show icon in circle?
    iconCircleColor?: string; // New: color of icon circle
  };
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type?: string;
};

type GraphStore = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  hiddenNodeIds: Set<string>;
  manualPositions: Record<string, { x: number; y: number }>;
  setNodes: (nodes: GraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;
  selectNode: (id: string | null) => void;
  hideNode: (id: string) => void;
  showNode: (id: string) => void;
  showAllHiddenNodes: () => void;
  setManualPosition: (id: string, pos: { x: number; y: number }) => void;
};

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  hiddenNodeIds: new Set(),
  manualPositions: {},
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (id) => set({ selectedNodeId: id }),
  hideNode: (id) => {
    set((state) => {
      const hiddenNodeIds = new Set(state.hiddenNodeIds);
      hiddenNodeIds.add(id);
      return { hiddenNodeIds };
    });
  },
  showNode: (id) => {
    set((state) => {
      const hiddenNodeIds = new Set(state.hiddenNodeIds);
      hiddenNodeIds.delete(id);
      return { hiddenNodeIds };
    });
  },
  showAllHiddenNodes: () => set({ hiddenNodeIds: new Set() }),
  setManualPosition: (id, pos) =>
    set((state) => ({
      manualPositions: { ...state.manualPositions, [id]: pos },
    })),
}));
