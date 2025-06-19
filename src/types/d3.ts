import * as d3 from 'd3';
import { GraphNode, GraphEdge } from './graph';

// D3 Simulation Node type that extends GraphNode with simulation properties
export interface D3SimulationNode extends GraphNode {
  index?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

// D3 Simulation Link type that extends GraphEdge with simulation properties
export interface D3SimulationLink extends GraphEdge {
  index?: number;
  source: string | D3SimulationNode;
  target: string | D3SimulationNode;
}

// Type for D3 Force Simulation
export type D3ForceSimulation = d3.Simulation<D3SimulationNode, D3SimulationLink>;

// Type for D3 Selection with proper generics
export type D3Selection<T extends d3.BaseType> = d3.Selection<T, D3SimulationNode, null, undefined>;
export type D3LinkSelection<T extends d3.BaseType> = d3.Selection<T, D3SimulationLink, null, undefined>;

// Type for D3 Drag behavior
export type D3DragBehavior = d3.DragBehavior<SVGGElement, D3SimulationNode, D3SimulationNode>;

// Type for D3 Zoom behavior
export type D3ZoomBehavior = d3.ZoomBehavior<SVGSVGElement, unknown>;

// Type for D3 Scale
export type D3Scale = d3.ScaleLinear<number, number>;

// Type for hierarchy data
export interface HierarchyNodeData {
  id: string;
  children?: HierarchyNodeData[];
  [key: string]: unknown;
}

// Type for D3 hierarchy node
export type D3HierarchyNode = d3.HierarchyNode<HierarchyNodeData>;
export type D3HierarchyPointNode = d3.HierarchyPointNode<HierarchyNodeData>;

// Type for tree/cluster layout
export type D3TreeLayout = d3.TreeLayout<HierarchyNodeData>;
export type D3ClusterLayout = d3.ClusterLayout<HierarchyNodeData>;