import { GraphNode, Edge } from '@/types/graph.types';

export function generateTransparentTestGraph(nodeCount: number = 50) {
  const nodes: GraphNode[] = [];
  const edges: Edge[] = [];
  
  const nodeTypes = ['person', 'company', 'product', 'location', 'document'];
  const icons = ['👤', '🏢', '📦', '📍', '📄'];
  
  // Transparent and semi-transparent backgrounds
  const bgColors = [
    'transparent',                    // Fully transparent
    'rgba(59, 130, 246, 0.2)',       // 20% blue
    'rgba(34, 197, 94, 0.3)',        // 30% green
    'rgba(239, 68, 68, 0.2)',        // 20% red
    'rgba(255, 255, 255, 0.1)'       // 10% white (glass effect)
  ];
  
  const borderColors = [
    '#9ca3af',                       // Gray for transparent
    'rgba(59, 130, 246, 0.8)',      // 80% blue
    'rgba(34, 197, 94, 0.8)',       // 80% green
    'rgba(239, 68, 68, 0.8)',       // 80% red
    'rgba(255, 255, 255, 0.5)'      // 50% white
  ];
  
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
        borderEnabled: true,
        borderColor: borderColors[typeIndex],
        borderWidth: 2
      },
      attributes: {
        created: new Date().toISOString(),
        weight: Math.random() * 100,
        category: nodeTypes[typeIndex]
      }
    });
  }
  
  // Generate edges (sparse graph, ~2-3 edges per node average)
  const edgeCount = Math.floor(nodeCount * 2.5);
  const edgeTypes = ['CONNECTED_TO', 'KNOWS', 'WORKS_AT', 'OWNS', 'LOCATED_IN'];
  
  for (let i = 0; i < edgeCount; i++) {
    const source = Math.floor(Math.random() * nodeCount);
    let target = Math.floor(Math.random() * nodeCount);
    
    // Avoid self-loops
    while (target === source) {
      target = Math.floor(Math.random() * nodeCount);
    }
    
    edges.push({
      id: `edge-${i}`,
      source: `node-${source}`,
      target: `node-${target}`,
      type: edgeTypes[i % edgeTypes.length],
      appearance: {
        color: 'rgba(148, 163, 184, 0.6)', // Semi-transparent edges
        width: 1 + Math.random() * 2
      }
    });
  }
  
  return { nodes, edges };
}