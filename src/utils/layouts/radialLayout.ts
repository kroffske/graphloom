import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface RadialLayoutOptions {
  center: [number, number];
  radius: number;
  startAngle?: number;
  endAngle?: number;
  levelGap?: number;
}

interface RadialNode extends SimulationNodeDatum {
  id: string;
  x?: number;
  y?: number;
  level?: number;
}

export function applyRadialLayout<T extends RadialNode>(
  nodes: T[],
  edges: SimulationLinkDatum<T>[],
  options: RadialLayoutOptions
): void {
  const {
    center,
    radius,
    startAngle = 0,
    endAngle = 2 * Math.PI,
    levelGap = 60
  } = options;
  
  // Build adjacency information
  const nodeMap = new Map<string, T>();
  const neighbors = new Map<string, Set<string>>();
  
  nodes.forEach(node => {
    nodeMap.set(node.id, node);
    neighbors.set(node.id, new Set());
  });
  
  edges.forEach(edge => {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
    neighbors.get(sourceId)?.add(targetId);
    neighbors.get(targetId)?.add(sourceId);
  });
  
  // Find the most connected node as center
  let centerNode = nodes[0];
  let maxConnections = 0;
  
  nodes.forEach(node => {
    const connections = neighbors.get(node.id)?.size || 0;
    if (connections > maxConnections) {
      maxConnections = connections;
      centerNode = node;
    }
  });
  
  // BFS to assign levels
  const visited = new Set<string>();
  const queue: { node: T; level: number }[] = [{ node: centerNode, level: 0 }];
  const levels: T[][] = [];
  
  while (queue.length > 0) {
    const { node, level } = queue.shift()!;
    
    if (visited.has(node.id)) continue;
    visited.add(node.id);
    
    node.level = level;
    
    if (!levels[level]) levels[level] = [];
    levels[level].push(node);
    
    // Add neighbors to queue
    const nodeNeighbors = neighbors.get(node.id) || new Set();
    nodeNeighbors.forEach(neighborId => {
      if (!visited.has(neighborId)) {
        const neighbor = nodeMap.get(neighborId);
        if (neighbor) {
          queue.push({ node: neighbor, level: level + 1 });
        }
      }
    });
  }
  
  // Position nodes by level
  levels.forEach((levelNodes, level) => {
    if (level === 0) {
      // Center node
      levelNodes[0].x = center[0];
      levelNodes[0].y = center[1];
    } else {
      // Arrange nodes in a circle at this level
      const levelRadius = levelGap * level;
      const angleStep = (endAngle - startAngle) / levelNodes.length;
      
      levelNodes.forEach((node, i) => {
        const angle = startAngle + i * angleStep;
        node.x = center[0] + levelRadius * Math.cos(angle);
        node.y = center[1] + levelRadius * Math.sin(angle);
      });
    }
  });
  
  // Handle any unconnected nodes
  const unpositioned = nodes.filter(n => !visited.has(n.id));
  if (unpositioned.length > 0) {
    const outerRadius = levelGap * (levels.length + 1);
    const angleStep = (endAngle - startAngle) / unpositioned.length;
    
    unpositioned.forEach((node, i) => {
      const angle = startAngle + i * angleStep;
      node.x = center[0] + outerRadius * Math.cos(angle);
      node.y = center[1] + outerRadius * Math.sin(angle);
    });
  }
}