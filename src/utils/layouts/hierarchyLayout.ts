import { SimulationNodeDatum, SimulationLinkDatum, tree, cluster, hierarchy as d3Hierarchy } from 'd3';

export interface HierarchyLayoutOptions {
  width: number;
  height: number;
  nodeSize?: [number, number];
  separation?: (a: any, b: any) => number;
  layoutType?: 'tree' | 'cluster';
}

interface HierarchyNode extends SimulationNodeDatum {
  id: string;
  x?: number;
  y?: number;
}

export function applyHierarchyLayout<T extends HierarchyNode>(
  nodes: T[],
  edges: SimulationLinkDatum<T>[],
  options: HierarchyLayoutOptions
): void {
  const {
    width = 900,
    height = 530,
    nodeSize,
    separation = (a, b) => a.parent === b.parent ? 1 : 2,
    layoutType = 'tree'
  } = options;
  
  // Build parent-child relationships from edges
  const nodeMap = new Map<string, T>();
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();
  
  nodes.forEach(node => nodeMap.set(node.id, node));
  
  // Analyze edges to find parent-child relationships
  edges.forEach(edge => {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
    
    // Assume edge goes from parent to child
    if (!childrenMap.has(sourceId)) {
      childrenMap.set(sourceId, []);
    }
    childrenMap.get(sourceId)!.push(targetId);
    parentMap.set(targetId, sourceId);
  });
  
  // Find root nodes (nodes with no parents)
  const roots = nodes.filter(node => !parentMap.has(node.id));
  
  if (roots.length === 0) {
    // If no clear root, use the first node
    roots.push(nodes[0]);
  }
  
  // For each root, build and layout its tree
  const margin = { top: 40, right: 40, bottom: 40, left: 40 };
  const treeWidth = (width - margin.left - margin.right) / roots.length;
  const treeHeight = height - margin.top - margin.bottom;
  
  roots.forEach((root, rootIndex) => {
    // Build hierarchical data
    const hierarchyData = buildHierarchy(root, childrenMap, nodeMap);
    
    // Create layout
    const layoutMethod = layoutType === 'cluster' ? cluster<any>() : tree<any>();
    
    if (nodeSize) {
      layoutMethod.nodeSize(nodeSize);
    } else {
      layoutMethod.size([treeWidth * 0.9, treeHeight]);
    }
    
    layoutMethod.separation(separation);
    
    // Apply layout
    const rootHierarchy = layoutMethod(hierarchyData);
    
    // Update node positions
    rootHierarchy.descendants().forEach(d => {
      const node = d.data;
      node.x = margin.left + rootIndex * treeWidth + d.y;
      node.y = margin.top + d.x;
    });
  });
  
  // Position any remaining unconnected nodes
  const positioned = new Set(
    roots.flatMap(root => 
      getDescendants(root, childrenMap, nodeMap).map(n => n.id)
    )
  );
  
  const unpositioned = nodes.filter(n => !positioned.has(n.id));
  if (unpositioned.length > 0) {
    // Arrange unpositioned nodes at the bottom
    const spacing = width / (unpositioned.length + 1);
    unpositioned.forEach((node, i) => {
      node.x = spacing * (i + 1);
      node.y = height - 40;
    });
  }
}

function buildHierarchy<T extends HierarchyNode>(
  root: T,
  childrenMap: Map<string, string[]>,
  nodeMap: Map<string, T>
): d3.HierarchyNode<T> {
  const visited = new Set<string>();
  
  function buildNode(node: T): any {
    visited.add(node.id);
    const childIds = childrenMap.get(node.id) || [];
    const children = childIds
      .filter(id => !visited.has(id))
      .map(id => nodeMap.get(id))
      .filter(child => child !== undefined)
      .map(child => buildNode(child!));
    
    return {
      data: node,
      children: children.length > 0 ? children : undefined
    };
  }
  
  return d3Hierarchy(buildNode(root));
}

function getDescendants<T extends HierarchyNode>(
  node: T,
  childrenMap: Map<string, string[]>,
  nodeMap: Map<string, T>
): T[] {
  const descendants: T[] = [node];
  const stack = [node.id];
  const visited = new Set<string>([node.id]);
  
  while (stack.length > 0) {
    const currentId = stack.pop()!;
    const childIds = childrenMap.get(currentId) || [];
    
    for (const childId of childIds) {
      if (!visited.has(childId)) {
        visited.add(childId);
        const child = nodeMap.get(childId);
        if (child) {
          descendants.push(child);
          stack.push(childId);
        }
      }
    }
  }
  
  return descendants;
}