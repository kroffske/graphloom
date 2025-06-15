
import create from "zustand";

// Graph Node & Edge structures (loosely modeled)
export type GraphNode = {
  id: string;
  type: string; // node type, used for icon mapping
  label: string;
  attributes: Record<string, string | number | boolean>;
  x?: number;
  y?: number;
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
  setNodes: (nodes: GraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;
  selectNode: (id: string | null) => void;
};

export const useGraphStore = create<GraphStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (id) => set({ selectedNodeId: id }),
}));
