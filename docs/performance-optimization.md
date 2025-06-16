# Performance Optimization Guide

This guide covers performance optimization techniques for handling large graphs efficiently.

## Rendering Optimizations

### Viewport Culling

The application automatically culls nodes and edges outside the viewport:

```typescript
// Only render visible nodes
const visibleNodes = nodes.filter(node => {
  const pos = positions.get(node.id);
  return pos && 
    pos.x >= visibleBounds.left && 
    pos.x <= visibleBounds.right && 
    pos.y >= visibleBounds.top && 
    pos.y <= visibleBounds.bottom;
});
```

**Benefits:**
- Reduces DOM elements from 5000+ to only what's visible
- Typically shows 50-200 nodes at standard zoom levels
- Edges are also culled based on their bounding box

### Level of Detail (LOD) Rendering

Different rendering quality based on zoom level:

| Zoom Level | Rendering Features |
|------------|-------------------|
| > 0.6      | Full detail: icons, labels, borders |
| 0.5 - 0.6  | Icons only, no labels |
| 0.3 - 0.5  | Simplified circles, no icons |
| < 0.3      | Minimal circles only |

### Update Frequency Throttling

For large graphs (>1000 nodes), updates are throttled:

```typescript
// 10 FPS for large graphs, 30 FPS for small graphs
const updateFrequency = nodes.length > 1000 ? 6 : 2;
if (tickCount % updateFrequency === 0) {
  setPositionsVersion(v => v + 1);
}
```

## Layout Algorithm Optimizations

### Force Simulation Settings

Optimized parameters for large graphs:

```typescript
const isLargeGraph = nodes.length > 1000;

// Faster convergence for large graphs
simulation
  .velocityDecay(isLargeGraph ? 0.6 : 0.4)    // More friction
  .alphaDecay(isLargeGraph ? 0.05 : 0.02)     // Faster cooling
  .alphaMin(isLargeGraph ? 0.01 : 0.001)      // Stop sooner
  .alpha(isLargeGraph ? 0.2 : 0.3);          // Lower initial energy
```

### Barnes-Hut Approximation

For force calculations in large graphs:

```typescript
.force('charge', d3.forceManyBody()
  .strength(isLargeGraph ? -300 : -400)
  .theta(isLargeGraph ? 0.9 : 0.8)      // More approximation
  .distanceMax(isLargeGraph ? 200 : 500) // Limit interaction range
)
```

### Fast Layout Option

Instant positioning for immediate overview:

```typescript
// Groups nodes by subgraph and positions them in a grid
// No iterative simulation - O(n) complexity
applyFastLayout(nodes, { width: 900, height: 530 });
```

## Data Structure Optimizations

### Edge Density Recommendations

For optimal performance:

| Node Count | Recommended Edges/Node | Total Edges |
|------------|----------------------|-------------|
| 100        | 2-3                  | 200-300     |
| 1,000      | 1.5-2                | 1,500-2,000 |
| 5,000      | 1-1.5                | 5,000-7,500 |
| 10,000     | 0.5-1                | 5,000-10,000|

### Subgraph Structure

Organizing nodes into subgraphs improves:
- Visual clarity
- Force simulation convergence
- User navigation

Recommended structure:
- 3-5 distinct subgraphs
- Dense internal connections (0.3-0.5 density)
- Sparse inter-subgraph connections (0.5% of nodes)

## Memory Management

### Position Caching

Node positions stored in a ref to avoid re-renders:

```typescript
const positionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
```

### React Component Optimization

Using React.memo with custom comparison:

```typescript
const GraphNodeV2 = React.memo(({ node, x, y, transform, onDrag }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison logic
  return prevProps.x === nextProps.x && 
         prevProps.y === nextProps.y &&
         // ... other comparisons
});
```

## Browser Performance Tips

### Chrome DevTools Settings

For profiling large graphs:
1. Disable React DevTools in production
2. Use Performance tab with CPU throttling
3. Enable GPU acceleration in chrome://flags

### Recommended Browser Settings

- Hardware acceleration: Enabled
- WebGL: Enabled
- Sufficient RAM: 4GB+ for 5000+ nodes

## Optimization Strategies by Graph Size

### Small Graphs (< 500 nodes)
- Use default settings
- All features enabled
- Focus on visual quality

### Medium Graphs (500-2000 nodes)
- Enable viewport culling
- Moderate LOD settings
- Optimize force parameters

### Large Graphs (2000-5000 nodes)
- Aggressive culling
- Early LOD transitions
- Fast layout option
- Reduced edge density

### Very Large Graphs (5000+ nodes)
- Minimal edge density (< 1 edge/node)
- Immediate "Fast" layout
- Maximum simplification
- Consider pagination or filtering

## Performance Monitoring

The application includes a performance indicator showing:
- Visible nodes vs total nodes
- Current zoom level
- Rendering mode (simplified or full)

Example: "Visible: 156/5000 nodes (zoom: 0.75x)"

## Common Performance Issues

### Issue: Slow Initial Layout
**Solution:** Use "Fast" layout for immediate positioning, then switch to force-directed if needed.

### Issue: Laggy Panning/Zooming
**Solution:** Reduce node size, enable more aggressive LOD, decrease edge density.

### Issue: High Memory Usage
**Solution:** Implement node pagination, reduce attribute data, use simplified rendering.

### Issue: Force Simulation Never Settles
**Solution:** Increase friction (velocityDecay), reduce alpha, limit simulation time.

## Best Practices

1. **Start Simple:** Begin with "Fast" layout for large graphs
2. **Progressive Enhancement:** Add visual details as user zooms in
3. **User Control:** Provide layout options and performance settings
4. **Monitor Performance:** Use the built-in performance indicator
5. **Test at Scale:** Always test with your expected maximum node count