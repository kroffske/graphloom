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
  appearance?: {
    color?: string;      // Edge color
    width?: number;      // Edge line thickness
    label?: string;      // Optional label
  };
};

type NodeTypeAppearanceMap = Record<string, {
  icon?: string;
  color?: string;
  size?: number;
  labelField?: string;
  backgroundColor?: string;
  lineColor?: string;
  showIconCircle?: boolean;
  iconCircleColor?: string;
  iconOrder?: string[];
}>;

type EdgeAppearanceMap = Record<string, {
  color?: string;
  width?: number;
  label?: string;
}>;

type GraphStore = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  hiddenNodeIds: Set<string>;
  manualPositions: Record<string, { x: number; y: number }>;
  setNodes: (nodes: GraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  hideNode: (id: string) => void;
  showNode: (id: string) => void;
  showAllHiddenNodes: () => void;
  setManualPosition: (id: string, pos: { x: number; y: number }) => void;
  // Add these lines:
  incrementalUpdateNodes: (changedNodes: GraphNode[]) => void;
  incrementalUpdateEdges: (changedEdges: GraphEdge[]) => void;
  nodeTypeAppearances: NodeTypeAppearanceMap;
  setNodeTypeAppearance: (type: string, appearance: NodeTypeAppearanceMap[string]) => void;
  resetNodeTypeAppearance: (type: string) => void;

  // New: edge appearance and selection
  edgeAppearances: EdgeAppearanceMap;
  setEdgeAppearance: (id: string, appearance: EdgeAppearanceMap[string]) => void;
  showEdgeLabels: boolean;
  toggleEdgeLabels: () => void;
};

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  hiddenNodeIds: new Set(),
  manualPositions: {},
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (id) => set({ selectedNodeId: id }),
  selectEdge: (id) => set({ selectedEdgeId: id }),
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
  // === New: Incremental node updates (merge/update existing, don't do full replaces) ===
  incrementalUpdateNodes: (changedNodes: GraphNode[]) => {
    set((state) => {
      const newNodes = [...state.nodes];
      changedNodes.forEach((incoming) => {
        const idx = newNodes.findIndex((n) => n.id === incoming.id);
        if (idx === -1) {
          newNodes.push(incoming);
        } else {
          newNodes[idx] = { ...newNodes[idx], ...incoming };
        }
      });
      return { nodes: newNodes };
    });
  },
  incrementalUpdateEdges: (changedEdges: GraphEdge[]) => {
    set((state) => {
      const newEdges = [...state.edges];
      changedEdges.forEach((incoming) => {
        const idx = newEdges.findIndex((e) => e.id === incoming.id);
        if (idx === -1) {
          newEdges.push(incoming);
        } else {
          newEdges[idx] = { ...newEdges[idx], ...incoming };
        }
      });
      return { edges: newEdges };
    });
  },
  nodeTypeAppearances: {},
  setNodeTypeAppearance: (type, appearance) =>
    set((state) => ({
      nodeTypeAppearances: { ...state.nodeTypeAppearances, [type]: { ...appearance } },
    })),
  resetNodeTypeAppearance: (type) =>
    set((state) => {
      const newMap = { ...state.nodeTypeAppearances };
      delete newMap[type];
      return { nodeTypeAppearances: newMap };
    }),

  // Edge appearance management
  edgeAppearances: {},
  setEdgeAppearance: (id, appearance) =>
    set((state) => ({
      edgeAppearances: { ...state.edgeAppearances, [id]: { ...state.edgeAppearances[id], ...appearance } },
      edges: state.edges.map((e) =>
        e.id === id ? { ...e, appearance: { ...state.edgeAppearances[id], ...appearance } } : e
      ),
    })),

  showEdgeLabels: true,
  toggleEdgeLabels: () => set((state) => ({ showEdgeLabels: !state.showEdgeLabels })),
}));
