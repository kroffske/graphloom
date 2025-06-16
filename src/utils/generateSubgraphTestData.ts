import { GraphNode, Edge } from '@/types/graph.types';

interface SubgraphConfig {
  id: string;
  nodeCount: number;
  nodeType: string;
  icon: string;
  color: string;
  backgroundColor: string;
  internalEdgeDensity: number; // 0-1, how connected nodes are within subgraph
}

export function generateSubgraphTestData(
  totalNodes: number = 5000,
  subgraphCount: number = 4,
  interSubgraphConnections: number = 10
) {
  const nodes: GraphNode[] = [];
  const edges: Edge[] = [];
  
  // Define subgraph configurations
  const subgraphConfigs: SubgraphConfig[] = [
    {
      id: 'users',
      nodeCount: Math.floor(totalNodes * 0.3), // 30% of nodes
      nodeType: 'person',
      icon: '👤',
      color: '#1e40af',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      internalEdgeDensity: 0.8 // Highly connected
    },
    {
      id: 'companies',
      nodeCount: Math.floor(totalNodes * 0.25), // 25% of nodes
      nodeType: 'company',
      icon: '🏢',
      color: '#065f46',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      internalEdgeDensity: 0.6
    },
    {
      id: 'products',
      nodeCount: Math.floor(totalNodes * 0.25), // 25% of nodes
      nodeType: 'product',
      icon: '📦',
      color: '#92400e',
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      internalEdgeDensity: 0.5
    },
    {
      id: 'locations',
      nodeCount: Math.floor(totalNodes * 0.2), // 20% of nodes
      nodeType: 'location',
      icon: '📍',
      color: '#9f1239',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      internalEdgeDensity: 0.3 // Loosely connected
    }
  ].slice(0, subgraphCount);
  
  // Adjust node counts to match total
  const currentTotal = subgraphConfigs.reduce((sum, config) => sum + config.nodeCount, 0);
  if (currentTotal < totalNodes) {
    subgraphConfigs[0].nodeCount += totalNodes - currentTotal;
  }
  
  let nodeIdCounter = 0;
  const subgraphNodeRanges = new Map<string, { start: number; end: number }>();
  
  // Generate nodes for each subgraph
  subgraphConfigs.forEach((config, subgraphIndex) => {
    const startId = nodeIdCounter;
    
    // Position nodes in distinct regions to help the force algorithm
    const centerX = 450 + (subgraphIndex % 2 === 0 ? -200 : 200);
    const centerY = 265 + (subgraphIndex < 2 ? -150 : 150);
    
    for (let i = 0; i < config.nodeCount; i++) {
      const angle = (i / config.nodeCount) * 2 * Math.PI;
      const radius = 50 + Math.random() * 100;
      
      nodes.push({
        id: `node-${nodeIdCounter}`,
        type: config.nodeType,
        label: `${config.nodeType} ${nodeIdCounter}`,
        appearance: {
          icon: config.icon,
          backgroundColor: config.backgroundColor,
          color: config.color,
          borderEnabled: true,
          borderColor: config.color,
          borderWidth: 1
        },
        attributes: {
          subgraph: config.id,
          created: new Date().toISOString(),
          weight: Math.random() * 100
        },
        // Initialize with positions to help force algorithm converge faster
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
      
      nodeIdCounter++;
    }
    
    subgraphNodeRanges.set(config.id, { start: startId, end: nodeIdCounter - 1 });
  });
  
  // Generate internal edges for each subgraph
  let edgeIdCounter = 0;
  subgraphConfigs.forEach(config => {
    const range = subgraphNodeRanges.get(config.id)!;
    const nodeCount = range.end - range.start + 1;
    const edgeCount = Math.floor(nodeCount * config.internalEdgeDensity * 2);
    
    const addedEdges = new Set<string>();
    
    for (let i = 0; i < edgeCount; i++) {
      const source = range.start + Math.floor(Math.random() * nodeCount);
      let target = range.start + Math.floor(Math.random() * nodeCount);
      
      // Avoid self-loops and duplicate edges
      while (target === source || addedEdges.has(`${source}-${target}`) || addedEdges.has(`${target}-${source}`)) {
        target = range.start + Math.floor(Math.random() * nodeCount);
      }
      
      const edgeKey = `${source}-${target}`;
      addedEdges.add(edgeKey);
      
      edges.push({
        id: `edge-${edgeIdCounter++}`,
        source: `node-${source}`,
        target: `node-${target}`,
        type: 'INTERNAL',
        appearance: {
          color: config.color,
          width: 1,
          opacity: 0.3
        }
      });
    }
  });
  
  // Generate sparse inter-subgraph connections
  const subgraphIds = Array.from(subgraphNodeRanges.keys());
  for (let i = 0; i < interSubgraphConnections && subgraphIds.length > 1; i++) {
    const sourceSubgraph = subgraphIds[Math.floor(Math.random() * subgraphIds.length)];
    let targetSubgraph = subgraphIds[Math.floor(Math.random() * subgraphIds.length)];
    
    // Ensure different subgraphs
    while (targetSubgraph === sourceSubgraph) {
      targetSubgraph = subgraphIds[Math.floor(Math.random() * subgraphIds.length)];
    }
    
    const sourceRange = subgraphNodeRanges.get(sourceSubgraph)!;
    const targetRange = subgraphNodeRanges.get(targetSubgraph)!;
    
    const sourceNode = sourceRange.start + Math.floor(Math.random() * (sourceRange.end - sourceRange.start + 1));
    const targetNode = targetRange.start + Math.floor(Math.random() * (targetRange.end - targetRange.start + 1));
    
    edges.push({
      id: `edge-${edgeIdCounter++}`,
      source: `node-${sourceNode}`,
      target: `node-${targetNode}`,
      type: 'INTER_SUBGRAPH',
      appearance: {
        color: '#64748b',
        width: 2,
        opacity: 0.5,
        strokeDasharray: '5,5' // Dashed line for inter-subgraph
      }
    });
  }
  
  console.log(`Generated ${nodes.length} nodes in ${subgraphCount} subgraphs with ${edges.length} edges`);
  console.log(`Internal edges: ${edges.filter(e => e.type === 'INTERNAL').length}`);
  console.log(`Inter-subgraph edges: ${edges.filter(e => e.type === 'INTER_SUBGRAPH').length}`);
  
  return { nodes, edges };
}