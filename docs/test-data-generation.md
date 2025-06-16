# Test Data Generation Guide

This guide explains how to generate and customize test data for development and testing.

## Quick Start

Generate test data using the UI buttons or programmatically:

```typescript
import { generateTestGraph, generateLargeTestGraph } from '@/utils/generateTestGraph';

// Generate 5000 nodes with subgraph structure
const { nodes, edges } = generateLargeTestGraph();

// Generate custom size
const customGraph = generateTestGraph(1000);
```

## Test Data Generators

### Main Generator Functions

1. **generateSmallTestGraph()** - 50 nodes for quick testing
2. **generateMediumTestGraph()** - 500 nodes for performance testing  
3. **generateLargeTestGraph()** - 5000 nodes for stress testing
4. **generateTestGraph(nodeCount)** - Custom node count

### Subgraph Structure (500+ nodes)

For graphs with 500+ nodes, the generator creates a realistic subgraph structure:

```typescript
// Default subgraph distribution for 5000 nodes:
- Users (30%): 1500 nodes, high connectivity (0.4 density)
- Companies (25%): 1250 nodes, medium connectivity (0.3 density)
- Products (25%): 1250 nodes, medium connectivity (0.25 density)
- Locations (20%): 1000 nodes, low connectivity (0.15 density)
```

## Customizing Test Data

### Adjusting Edge Density

Edit `src/utils/generateSubgraphTestData.ts`:

```typescript
const subgraphConfigs: SubgraphConfig[] = [
  {
    id: 'users',
    nodeCount: Math.floor(totalNodes * 0.3),
    nodeType: 'person',
    icon: '👤',
    color: '#1e40af',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    internalEdgeDensity: 0.4  // Adjust this (0-1)
  },
  // ... more subgraphs
];
```

### Edge Density Guidelines

| Graph Size | Recommended Density | Edges per Node |
|------------|-------------------|----------------|
| Small (< 100) | 0.5-0.8 | 2-3 |
| Medium (100-1000) | 0.3-0.5 | 1.5-2 |
| Large (1000-5000) | 0.15-0.4 | 1-1.5 |
| Very Large (5000+) | 0.1-0.2 | 0.5-1 |

### Adding Custom Node Types

1. Define the new type configuration:

```typescript
{
  id: 'servers',
  nodeCount: Math.floor(totalNodes * 0.15),
  nodeType: 'server',
  icon: '🖥️',
  color: '#6b21a8',
  backgroundColor: 'rgba(147, 51, 234, 0.1)',
  internalEdgeDensity: 0.7
}
```

2. Update the node type arrays in `generateTestGraph.ts`:

```typescript
const nodeTypes = ['person', 'company', 'product', 'location', 'server'];
const icons = ['👤', '🏢', '📦', '📍', '🖥️'];
```

### Customizing Inter-Subgraph Connections

Control connections between different subgraphs:

```typescript
// In generateTestGraph.ts
generateSubgraphTestData(
  nodeCount,           // Total nodes
  4,                   // Number of subgraphs
  Math.floor(nodeCount * 0.005)  // Inter-subgraph connections
);
```

Current default: 0.5% of total nodes (25 connections for 5000 nodes)

## Node Attributes

Each generated node includes:

```typescript
{
  id: 'node-123',
  type: 'person',
  label: 'person 123',
  appearance: {
    icon: '👤',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#1e40af',
    borderEnabled: true,
    borderColor: '#1e40af',
    borderWidth: 1
  },
  attributes: {
    subgraph: 'users',  // For subgraph layouts
    created: '2024-01-01T00:00:00Z',
    weight: 75.5,       // Random 0-100
    // Custom attributes can be added here
  },
  // Initial positions (helps force layout converge)
  x: 250,
  y: 350
}
```

## Edge Types

Generated edges include type information:

```typescript
{
  id: 'edge-456',
  source: 'node-123',
  target: 'node-789',
  type: 'INTERNAL' | 'INTER_SUBGRAPH',
  appearance: {
    color: '#1e40af',     // Subgraph color for internal
    width: 1,
    opacity: 0.3,         // 0.3 for internal, 0.5 for inter
    strokeDasharray: '5,5' // Dashed for inter-subgraph
  }
}
```

## Performance Considerations

### Memory Usage

Approximate memory usage:

| Nodes | Edges | Memory (MB) |
|-------|-------|-------------|
| 100 | 150 | ~1 |
| 1,000 | 1,500 | ~10 |
| 5,000 | 7,500 | ~50 |
| 10,000 | 15,000 | ~100 |

### Generation Time

Test data generation is fast but consider:
- Pre-generate for consistent testing
- Cache generated data for development
- Use smaller sets for unit tests

## Testing Scenarios

### 1. Sparse Graph

```typescript
// Reduce edge density
generateSubgraphTestData(1000, 4, 5); // Only 5 inter-connections
```

### 2. Dense Clusters

```typescript
// Increase internal density
internalEdgeDensity: 0.8  // Very connected subgraphs
```

### 3. Random Distribution

```typescript
// Use original generator for < 500 nodes
generateTestGraph(200); // No subgraph structure
```

### 4. Single Large Component

```typescript
// One subgraph with all nodes
generateSubgraphTestData(1000, 1, 0);
```

## Debugging Test Data

### Console Logging

The generator logs statistics:

```
Generated 5000 nodes in 4 subgraphs with 3750 edges
Internal edges: 3725
Inter-subgraph edges: 25
```

### Inspecting Structure

```typescript
// Check subgraph distribution
const subgraphCounts = new Map();
nodes.forEach(node => {
  const subgraph = node.attributes?.subgraph || 'none';
  subgraphCounts.set(subgraph, (subgraphCounts.get(subgraph) || 0) + 1);
});
console.log('Subgraph distribution:', subgraphCounts);
```

### Validating Edges

```typescript
// Verify edge validity
edges.forEach(edge => {
  const source = nodes.find(n => n.id === edge.source);
  const target = nodes.find(n => n.id === edge.target);
  if (!source || !target) {
    console.error('Invalid edge:', edge);
  }
});
```

## Best Practices

1. **Match your use case:** Generate data similar to your production graphs
2. **Test edge cases:** Very sparse, very dense, disconnected components
3. **Profile performance:** Use Performance tab with your typical data size
4. **Consistent testing:** Save generated data for reproducible tests
5. **Incremental testing:** Start small, increase size gradually

## Custom Data Import

For real-world testing, import CSV data:

1. Prepare nodes.csv:
```csv
id,type,label
1,person,Alice
2,company,TechCorp
```

2. Prepare edges.csv:
```csv
source,target,type
1,2,WORKS_AT
```

3. Use the Upload Panel in the UI to import

## Extending the Generator

To add custom generation logic:

1. Create new generator function
2. Add custom attributes
3. Implement specific edge patterns
4. Export from test utils

Example:
```typescript
export function generateHierarchicalTestData(levels: number, childrenPerNode: number) {
  // Custom hierarchical structure generation
}
```