# Layout Algorithms Guide

This guide describes the available layout algorithms and their optimal use cases.

## Available Layouts

### 1. Force Layout (D3 Force)

**Best for:** General-purpose graph visualization, organic clustering

**Characteristics:**
- Physics-based simulation
- Nodes repel each other
- Edges act as springs
- Naturally clusters connected components

**Parameters:**
```typescript
// Key parameters
.force('link', d3.forceLink()
  .distance(80)      // Target edge length
  .strength(0.8)     // Edge attraction strength
)
.force('charge', d3.forceManyBody()
  .strength(-400)    // Node repulsion strength
  .distanceMax(500)  // Maximum interaction distance
)
.force('collision', d3.forceCollide()
  .radius(22)        // Minimum node separation
)
```

**When to use:**
- Exploring unknown graph structure
- Finding natural clusters
- General-purpose visualization

### 2. ForceAtlas2 Layout

**Best for:** Large graphs with community structure

**Characteristics:**
- Gephi's algorithm for large networks
- Better community detection than D3 Force
- LinLog mode for varying densities
- Barnes-Hut approximation for performance

**Parameters:**
```typescript
new ForceAtlas2Layout(nodes, edges, {
  gravity: 1.0,         // Pull toward center
  scalingRatio: 10.0,   // Node spacing
  barnesHutTheta: 0.8,  // Approximation accuracy
  linLogMode: true,     // Better for power-law graphs
  preventOverlap: true,
  nodeSize: 20
})
```

**When to use:**
- Large social networks
- Graphs with clear communities
- When D3 Force is too slow

### 3. OpenOrd Layout

**Best for:** Very large graphs (10,000+ nodes)

**Characteristics:**
- Multi-stage algorithm
- 5 phases: liquid → expansion → cooldown → crunch → simmer
- Excellent for massive graphs
- Produces tight clusters

**Stages:**
```typescript
stages: {
  liquid: { iterations: 100, temperature: 0.2 },     // Initial chaos
  expansion: { iterations: 100, temperature: 0.15 }, // Spread out
  cooldown: { iterations: 100, temperature: 0.1 },  // Stabilize
  crunch: { iterations: 50, temperature: 0.05 },    // Compress
  simmer: { iterations: 25, temperature: 0.01 }     // Fine-tune
}
```

**When to use:**
- Graphs with 10,000+ nodes
- Need clear community separation
- When other algorithms are too slow

### 4. Circle Layout

**Best for:** Simple overviews, comparing node types

**Characteristics:**
- Nodes arranged in a circle
- No edge crossing optimization
- Equal spacing between nodes
- Very fast (no iteration)

**Parameters:**
```typescript
applyCircleLayout(nodes, {
  center: [450, 265],  // Circle center
  radius: 200          // Circle radius
})
```

**When to use:**
- Small graphs (< 100 nodes)
- Showing all nodes equally
- Simple presentations

### 5. Hierarchy Layout

**Best for:** Tree structures, organizational charts

**Characteristics:**
- Top-down tree layout
- Requires clear parent-child relationships
- No cycles allowed
- Deterministic result

**Parameters:**
```typescript
applyHierarchyLayout(nodes, edges, {
  width: 900,      // Layout width
  height: 530,     // Layout height
  nodeHeight: 80,  // Vertical spacing
  nodeWidth: 120   // Horizontal spacing
})
```

**When to use:**
- Organizational hierarchies
- File system structures
- Decision trees
- Any directed acyclic graph

### 6. Radial Layout

**Best for:** Hierarchical data with a central focus

**Characteristics:**
- Tree layout in circular form
- Root at center, children in rings
- Good for showing depth levels
- Compact representation

**Parameters:**
```typescript
applyRadialLayout(nodes, edges, {
  center: [450, 265],  // Layout center
  radius: 200,         // Maximum radius
  angleRange: [0, 2 * Math.PI]  // Full circle
})
```

**When to use:**
- Centered hierarchies
- Ego networks (node + neighbors)
- Taxonomies
- Mind maps

### 7. Fast Layout

**Best for:** Immediate visualization of large graphs

**Characteristics:**
- Instant positioning (no iteration)
- Groups by subgraph attribute
- Grid-based subgraph arrangement
- Optional collision resolution

**Algorithm:**
1. Groups nodes by `subgraph` attribute
2. Arranges subgraphs in a grid
3. Places nodes circularly within subgroups
4. Positions ungrouped nodes around edges

**When to use:**
- Initial view of large graphs
- When immediate feedback is needed
- Graphs with known clustering
- Performance is critical

## Layout Selection Strategy

### By Graph Size

| Node Count | Recommended Layouts |
|------------|-------------------|
| < 100      | Any layout works well |
| 100-500    | Force, ForceAtlas2, Hierarchy |
| 500-2000   | ForceAtlas2, Fast + Force |
| 2000-5000  | Fast, ForceAtlas2 (limited time) |
| 5000+      | Fast, OpenOrd |

### By Graph Type

| Graph Type | Best Layouts |
|------------|-------------|
| Social Network | ForceAtlas2, Force |
| Hierarchy/Tree | Hierarchy, Radial |
| Unknown Structure | Force, Fast |
| Dense Graph | OpenOrd, ForceAtlas2 |
| Sparse Graph | Force, Circle |

### By Use Case

| Use Case | Recommended Layout |
|----------|-------------------|
| First exploration | Fast → Force |
| Finding communities | ForceAtlas2 |
| Presentation | Circle, Radial |
| Analysis | Force, ForceAtlas2 |
| Performance demo | Fast |

## Combining Layouts

### Sequential Application

Start with fast layout, then refine:

```typescript
// 1. Quick overview
applyFastLayout(nodes);

// 2. Then run force for 2 seconds
const simulation = d3.forceSimulation(nodes)
  .force('charge', d3.forceManyBody())
  .alpha(0.1);  // Low energy for refinement
```

### Hybrid Approaches

1. **Fast + Local Force:** Position with Fast, apply force to overlapping nodes only
2. **Hierarchy + Force:** Use hierarchy for main structure, force for same-level nodes
3. **Subgraph Layouts:** Different layouts for different subgraphs

## Performance Tips by Layout

### Force Layout
- Limit simulation time
- Reduce alpha for faster convergence
- Increase velocity decay

### ForceAtlas2
- Enable Barnes-Hut for large graphs
- Stop after 3-5 seconds
- Use LinLog mode for power-law graphs

### OpenOrd
- Reduce iterations for each stage
- Skip stages for faster results
- Use spatial indexing

### Fast Layout
- Pre-calculate subgraph membership
- Cache positions between renders
- Use with viewport culling

## Layout Transitions

When switching layouts:

1. **Save current positions** before switching
2. **Animate transitions** for better UX
3. **Maintain zoom/pan** state
4. **Show progress** for long-running layouts

## Custom Layout Development

To add a new layout:

1. Create file in `src/utils/layouts/`
2. Implement positioning algorithm
3. Export from `layouts/index.ts`
4. Add to LayoutSelector component
5. Handle in GraphCanvasV2 switch statement

Basic template:
```typescript
export function applyCustomLayout<T extends LayoutNode>(
  nodes: T[],
  edges: Edge[],
  options: CustomOptions
): void {
  nodes.forEach((node, i) => {
    node.x = calculateX(i, options);
    node.y = calculateY(i, options);
  });
}
```