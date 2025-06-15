// FIX: Use named import instead of default import for zustand
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
    color?: string; // hex or color name
    size?: number; // px, default 64
    labelField?: string; // key to show (else "label")
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
