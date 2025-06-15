import { NodeTypeAppearance, EdgeTypeAppearance } from "./appearance";
import type { GraphNode, GraphEdge } from "./graph";

export type NodeTypeVisualSettingsProps = {
  backgroundColor: string;
  setBackgroundColor: (c: string) => void;
  size: number;
  setSize: (n: number) => void;
  labelField: string;
  setLabelField: (s: string) => void;
};

export type NodeTypeAppearanceFormProps = {
  onSave: (type: string, appearance: NodeTypeAppearance) => void;
  onReset: (type: string) => void;
  selectedType: string;
  onSelectedTypeChange: (type: string) => void;
  appearance: NodeTypeAppearance;
  nodeTypeKeys: string[];
  nodeTypeLabels: Record<string, string>;
};

export type NodeTypeAppearanceSettingsProps = {
  onSave: (type: string, appearance: NodeTypeAppearance) => void;
  onReset: (type: string) => void;
  selectedType: string;
  onSelectedTypeChange: (type: string) => void;
  appearance: NodeTypeAppearance;
  nodeTypeKeys: string[];
  nodeTypeLabels: Record<string, string>;
};

export type EdgeTypeAppearanceFormProps = {
  type: string;
  allTypes?: string[];
  onTypeChange?: (t: string) => void;
  onSave: (type: string, appearance: EdgeTypeAppearance) => void;
  onReset: (type: string) => void;
};

export type EdgeTypeAppearanceSettingsProps = {
  onSave: (type: string, appearance: EdgeTypeAppearance) => void;
  onReset: (type: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  allTypes: string[];
};

export type NodeSettingsFormProps = {
  node: GraphNode;
  onSaveSuccess?: () => void;
};

export type EdgeSettingsFormProps = {
  edge: GraphEdge;
};
