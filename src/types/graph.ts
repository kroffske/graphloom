
import { NodeTypeAppearance, EdgeTypeAppearance } from "./appearance";

export type GraphNode = {
  id: string;
  type: string;
  label: string;
  attributes: Record<string, string | number | boolean>;
  x?: number;
  y?: number;
  appearance?: NodeTypeAppearance;
};

export type GraphEdgeAppearance = EdgeTypeAppearance & { label?: string };

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type?: string;
  attributes?: Record<string, string | number | boolean>;
  appearance?: GraphEdgeAppearance;
  timestamp?: number;
};

export type GraphEdgeAppearanceMap = Record<string, GraphEdgeAppearance>;
