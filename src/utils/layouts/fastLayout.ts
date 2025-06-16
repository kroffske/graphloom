import { SimulationNodeDatum } from 'd3';

interface FastLayoutNode extends SimulationNodeDatum {
  id: string;
  x?: number;
  y?: number;
  attributes?: { subgraph?: string };
}

export function applyFastLayout<T extends FastLayoutNode>(
  nodes: T[],
  options: {
    width?: number;
    height?: number;
    padding?: number;
  } = {}
): void {
  const {
    width = 900,
    height = 530,
    padding = 100
  } = options;
  
  // Group nodes by subgraph
  const subgraphs = new Map<string, T[]>();
  const unassigned: T[] = [];
  
  nodes.forEach(node => {
    const subgraph = node.attributes?.subgraph;
    if (subgraph) {
      if (!subgraphs.has(subgraph)) {
        subgraphs.set(subgraph, []);
      }
      subgraphs.get(subgraph)!.push(node);
    } else {
      unassigned.push(node);
    }
  });
  
  // If no subgraphs, fall back to grid layout
  if (subgraphs.size === 0) {
    applyGridLayout(nodes, width, height, padding);
    return;
  }
  
  // Calculate grid dimensions for subgraphs
  const subgraphCount = subgraphs.size;
  const cols = Math.ceil(Math.sqrt(subgraphCount));
  const rows = Math.ceil(subgraphCount / cols);
  
  const cellWidth = (width - 2 * padding) / cols;
  const cellHeight = (height - 2 * padding) / rows;
  
  // Layout each subgraph in its cell
  let subgraphIndex = 0;
  subgraphs.forEach((subgraphNodes, subgraphId) => {
    const col = subgraphIndex % cols;
    const row = Math.floor(subgraphIndex / cols);
    
    const centerX = padding + cellWidth * (col + 0.5);
    const centerY = padding + cellHeight * (row + 0.5);
    
    // Use circular layout within each subgraph
    layoutSubgraphCircular(subgraphNodes, centerX, centerY, Math.min(cellWidth, cellHeight) * 0.4);
    
    subgraphIndex++;
  });
  
  // Place unassigned nodes around the edges
  if (unassigned.length > 0) {
    const angleStep = (2 * Math.PI) / unassigned.length;
    const radius = Math.min(width, height) * 0.45;
    const centerX = width / 2;
    const centerY = height / 2;
    
    unassigned.forEach((node, i) => {
      const angle = i * angleStep;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });
  }
}

function layoutSubgraphCircular<T extends FastLayoutNode>(
  nodes: T[],
  centerX: number,
  centerY: number,
  maxRadius: number
): void {
  if (nodes.length === 0) return;
  
  if (nodes.length === 1) {
    nodes[0].x = centerX;
    nodes[0].y = centerY;
    return;
  }
  
  // Use concentric circles for larger subgraphs
  const nodesPerCircle = 20;
  const circles = Math.ceil(nodes.length / nodesPerCircle);
  
  let nodeIndex = 0;
  for (let circle = 0; circle < circles; circle++) {
    const radius = (maxRadius * (circle + 1)) / circles;
    const nodesInThisCircle = Math.min(
      nodesPerCircle,
      nodes.length - nodeIndex
    );
    const angleStep = (2 * Math.PI) / nodesInThisCircle;
    
    for (let i = 0; i < nodesInThisCircle; i++) {
      const angle = i * angleStep;
      const node = nodes[nodeIndex++];
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    }
  }
}

function applyGridLayout<T extends FastLayoutNode>(
  nodes: T[],
  width: number,
  height: number,
  padding: number
): void {
  const n = nodes.length;
  if (n === 0) return;
  
  // Calculate grid dimensions
  const aspectRatio = width / height;
  const cols = Math.ceil(Math.sqrt(n * aspectRatio));
  const rows = Math.ceil(n / cols);
  
  const cellWidth = (width - 2 * padding) / cols;
  const cellHeight = (height - 2 * padding) / rows;
  
  // Place nodes in grid
  nodes.forEach((node, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    
    node.x = padding + cellWidth * (col + 0.5);
    node.y = padding + cellHeight * (row + 0.5);
  });
}