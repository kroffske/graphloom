# Problem Areas: Detailed Code Analysis

## 1. CreateRoot Inside D3 Elements

### useD3SvgGraph.tsx (lines 305-341)
```typescript
setTimeout(() => {
  simNodes.forEach((n) => {
    const mountPoint = document.getElementById(`d3-node-${n.id}`);
    if (mountPoint) {
      import("react-dom/client").then((ReactDOMClient) => {
        // Creates React root inside D3-managed foreignObject
        root = ReactDOMClient.createRoot(mountPoint);
        root.render(<GraphD3NodeMount ... />);
      });
    }
  });
}, 0);
```
**Issue**: React roots created inside elements that D3 will remove

### GraphD3NodeLayer.tsx (lines 45-76)
```typescript
simNodes.forEach((n) => {
  const mountPoint = document.getElementById(`d3-node-${n.id}`);
  if (mountPoint) {
    // Another createRoot inside D3 element
    root = ReactDOMClient.createRoot(mountPoint);
  }
});
```
**Issue**: Duplicate root creation, competing with useD3SvgGraph

## 2. D3 DOM Removal During Filtering

### useD3SvgGraph.tsx (line 131)
```typescript
svg.selectAll("*").remove(); // Removes everything including React roots
```
**Issue**: Brutal removal without React cleanup

### Time Filtering Impact (GraphD3Canvas.tsx)
```typescript
const filteredEdges = React.useMemo(() => {
  return baseFiltered.filter(e => {
    return e.timestamp >= timeRange[0] && e.timestamp <= timeRange[1];
  });
}, [edges, filteredNodeIds, timeRange, minTs, maxTs]);
```
**Result**: Changed edges → D3 re-renders → Removes all nodes → React roots orphaned

## 3. ForeignObject Pattern

### useD3SvgGraph.tsx (lines 223-233)
```typescript
nodeG
  .append("foreignObject")
  .attr("width", NODE_RADIUS * 2)
  .attr("height", NODE_RADIUS * 2)
  .attr("x", -NODE_RADIUS)
  .attr("y", -NODE_RADIUS)
  .append("xhtml:div")
  .html((d: any) => `<div id="d3-node-${d.id}"></div>`);
```
**Issue**: Mixing SVG foreignObject with React mounting points

## 4. Event Handler Conflicts

### D3 Events (useD3SvgGraph.tsx)
```typescript
nodeG
  .on("mouseenter", (_event, d: any) => setHoveredNodeId(d.id))
  .on("mouseleave", () => setHoveredNodeId(null))
  .on("contextmenu", function (event, d: any) => {
    event.preventDefault();
    setContextNodeId(d.id);
  });
```

### React Events (GraphD3NodeMount.tsx)
```typescript
onClick={(e) => {
  e.stopPropagation();
  selectNode(node.id);
}}
```
**Issue**: Event bubbling and propagation conflicts

## 5. Multiple Root Tracking Systems

### Global Map (useD3SvgGraph.tsx)
```typescript
const nodeRootsMap = new Map<string, any>();
```

### Module Map (GraphD3NodeLayer.tsx)
```typescript
const nodeLayerRootsMap = new Map<string, any>();
```

**Issue**: Two systems trying to track the same roots, neither fully effective

## 6. Cleanup Timing Issues

### Effect Cleanup (useD3SvgGraph.tsx)
```typescript
return () => {
  nodeRootsMap.forEach((root, id) => {
    try {
      root.unmount();
    } catch (e) {
      // Already unmounted by D3
    }
  });
};
```
**Issue**: Cleanup runs after D3 has already removed DOM nodes

## 7. State Synchronization

### Position Updates During Simulation
```typescript
simulation.on("tick", () => {
  nodeG.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
});
```
**Issue**: D3 updates DOM directly, React components need to know positions

## Summary of Core Issues

1. **Lifecycle Mismatch**: React expects to control component lifecycle, but D3 removes DOM nodes
2. **Multiple Truth Sources**: Both D3 and React try to manage the same elements
3. **Timing Problems**: Async React mounting vs synchronous D3 removal
4. **Event System Conflicts**: Two event systems on the same elements
5. **No Clear Boundaries**: Mixed responsibilities between libraries

## Required Architecture Changes

1. **Separate Render Layers**: React and D3 in different DOM trees
2. **Single Truth Source**: One system owns each piece of state
3. **Event Coordination**: Clear event flow between layers
4. **Explicit Lifecycle**: React controls React components only
5. **Position Syncing**: Transform data, not DOM elements