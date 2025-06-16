import { GraphNode, Edge } from '@/types/graph.types';
import { generateSubgraphTestData } from './generateSubgraphTestData';

export function generateTestGraph(nodeCount: number = 5000, includeTimestamps: boolean = true) {
  // For large graphs, use subgraph structure for better performance
  if (nodeCount >= 500) {
    return generateSubgraphTestData(nodeCount, 4, Math.floor(nodeCount * 0.005), includeTimestamps);
  }
  
  // Original implementation for small graphs
  const nodes: GraphNode[] = [];
  const edges: Edge[] = [];
  
  const nodeTypes = ['person', 'company', 'product', 'location', 'document'];
  const icons = ['👤', '🏢', '📦', '📍', '📄'];
  const bgColors = ['#dbeafe', '#fef3c7', '#d1fae5', '#fce7f3', '#e0e7ff'];
  const fgColors = ['#1e40af', '#92400e', '#065f46', '#9f1239', '#4338ca'];
  
  // Generate nodes
  for (let i = 0; i < nodeCount; i++) {
    const typeIndex = i % nodeTypes.length;
    nodes.push({
      id: `node-${i}`,
      type: nodeTypes[typeIndex],
      label: `${nodeTypes[typeIndex]} ${i}`,
      appearance: {
        icon: icons[typeIndex],
        backgroundColor: bgColors[typeIndex],
        color: fgColors[typeIndex]
      },
      attributes: {
        created: new Date().toISOString(),
        weight: Math.random() * 100,
        category: nodeTypes[typeIndex]
      }
    });
  }
  
  // Generate edges (sparse graph, ~1-1.5 edges per node average)
  const edgeCount = Math.floor(nodeCount * 1.25);
  const edgeTypes = ['CONNECTED_TO', 'KNOWS', 'WORKS_AT', 'OWNS', 'LOCATED_IN'];
  
  // Base timestamp for edge generation (7 days ago)
  const baseTimestamp = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const timeRange = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  
  for (let i = 0; i < edgeCount; i++) {
    const source = Math.floor(Math.random() * nodeCount);
    let target = Math.floor(Math.random() * nodeCount);
    
    // Avoid self-loops
    while (target === source) {
      target = Math.floor(Math.random() * nodeCount);
    }
    
    const edge: Edge = {
      id: `edge-${i}`,
      source: `node-${source}`,
      target: `node-${target}`,
      type: edgeTypes[i % edgeTypes.length],
      appearance: {
        color: '#94a3b8',
        width: 1 + Math.random() * 2
      }
    };
    
    if (includeTimestamps) {
      // Generate timestamp distributed over the time range
      const timestamp = baseTimestamp + Math.random() * timeRange;
      edge.attributes = {
        timestamp: new Date(timestamp).toISOString()
      };
    }
    
    edges.push(edge);
  }
  
  return { nodes, edges };
}

// Generate a smaller test graph for initial testing
export function generateSmallTestGraph() {
  return generateTestGraph(50);
}

// Generate a medium graph for performance testing
export function generateMediumTestGraph() {
  return generateTestGraph(500);
}

// Generate a large graph for stress testing
export function generateLargeTestGraph() {
  return generateTestGraph(5000);
}