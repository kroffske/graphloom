
import { create } from "zustand";
import { NodeTypeAppearanceMap, EdgeTypeAppearanceMap } from "@/types/appearance";
import type {
  GraphNode,
  GraphEdge,
  GraphEdgeAppearance,
  GraphEdgeAppearanceMap,
} from "@/types/graph";

export type GraphStore = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  hoveredNodeId: string | null;
  hoveredEdgeId: string | null;
  hiddenNodeIds: Set<string>;
  manualPositions: Record<string, { x: number; y: number }>;
  setNodes: (updater: GraphNode[] | ((nodes: GraphNode[]) => GraphNode[])) => void;
  setEdges: (edges: GraphEdge[]) => void;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  setHoveredNodeId: (id: string | null) => void;
  setHoveredEdgeId: (id: string | null) => void;
  hideNode: (id: string) => void;
  showNode: (id: string) => void;
  showAllHiddenNodes: () => void;
  setManualPosition: (id: string, pos: { x: number; y: number }) => void;
  updateNodeAppearance: (id: string, appearance: Partial<GraphNode['appearance']>) => void;
  incrementalUpdateNodes: (changedNodes: GraphNode[]) => void;
  incrementalUpdateEdges: (changedEdges: GraphEdge[]) => void;
  nodeTypeAppearances: NodeTypeAppearanceMap;
  setNodeTypeAppearance: (type: string, appearance: NodeTypeAppearanceMap[string]) => void;
  resetNodeTypeAppearance: (type: string) => void;
  // Edge type appearance
  edgeTypeAppearances: EdgeTypeAppearanceMap;
  setEdgeTypeAppearance: (type: string, appearance: EdgeTypeAppearanceMap[string]) => void;
  resetEdgeTypeAppearance: (type: string) => void;
  // New: edge appearance and selection
  edgeAppearances: GraphEdgeAppearanceMap;
  setEdgeAppearance: (id: string, appearance: GraphEdgeAppearance) => void;
  showEdgeLabels: boolean;
  toggleEdgeLabels: () => void;
  
  // Visibility settings
  showIsolatedNodes: boolean;
  toggleIsolatedNodes: () => void;

  // Time range filtering
  timeRange: { min: number; max: number } | null;
  selectedTimeRange: { start: number; end: number } | null;
  timestampField: string | null;
  setTimeRange: (range: { min: number; max: number } | null) => void;
  setSelectedTimeRange: (range: { start: number; end: number } | null) => void;
  setTimestampField: (field: string | null) => void;

  // Add: persistent uploaded file names & setters
  nodeFilename: string | null;
  setNodeFilename: (filename: string | null) => void;
  edgeFilename: string | null;
  setEdgeFilename: (filename: string | null) => void;

  // NEW: selected appearance types
  selectedNodeType: string | null;
  setSelectedNodeType: (type: string | null) => void;
  selectedEdgeType: string | null;
  setSelectedEdgeType: (type: string | null) => void;
};

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  hoveredNodeId: null,
  hoveredEdgeId: null,
  hiddenNodeIds: new Set(),
  manualPositions: {},
  setNodes: (updater) =>
    set((state) => ({
      nodes: typeof updater === "function" ? updater(state.nodes) : updater,
    })),
  setEdges: (edges) => set({ edges }),
  selectNode: (id) => set({ selectedNodeId: id }),
  selectEdge: (id) => set({ selectedEdgeId: id }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  setHoveredEdgeId: (id) => set({ hoveredEdgeId: id }),
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
  updateNodeAppearance: (id, appearance) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, appearance: { ...(n.appearance || {}), ...appearance } } : n
      ),
    })),
  incrementalUpdateNodes: (changedNodes) => {
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
  incrementalUpdateEdges: (changedEdges) => {
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

  // Edge type appearance state
  edgeTypeAppearances: {},
  setEdgeTypeAppearance: (type, appearance) =>
    set((state) => ({
      edgeTypeAppearances: { ...state.edgeTypeAppearances, [type]: { ...appearance } },
    })),
  resetEdgeTypeAppearance: (type) =>
    set((state) => {
      const map = { ...state.edgeTypeAppearances };
      delete map[type];
      return { edgeTypeAppearances: map };
    }),

  edgeAppearances: {},
  setEdgeAppearance: (id, appearance) =>
    set((state) => ({
      edgeAppearances: { ...state.edgeAppearances, [id]: { ...state.edgeAppearances[id], ...appearance } },
      edges: state.edges.map((e) =>
        e.id === id ? { ...e, appearance: { ...(e.appearance || {}), ...appearance } } : e
      ),
    })),

  showEdgeLabels: true,
  toggleEdgeLabels: () => set((state) => ({ showEdgeLabels: !state.showEdgeLabels })),
  
  // Visibility settings
  showIsolatedNodes: true,
  toggleIsolatedNodes: () => set((state) => ({ showIsolatedNodes: !state.showIsolatedNodes })),
  nodeFilename: null,
  edgeFilename: null,
  setNodeFilename: (filename) => set({ nodeFilename: filename }),
  setEdgeFilename: (filename) => set({ edgeFilename: filename }),

  // Time range filtering
  timeRange: null,
  selectedTimeRange: null,
  timestampField: null,
  setTimeRange: (range) => set({ timeRange: range }),
  setSelectedTimeRange: (range) => set({ selectedTimeRange: range }),
  setTimestampField: (field) => set({ timestampField: field }),

  // NEW: selected appearance types state
  selectedNodeType: null,
  setSelectedNodeType: (type) => set({ selectedNodeType: type }),
  selectedEdgeType: null,
  setSelectedEdgeType: (type) => set({ selectedEdgeType: type }),
}));
