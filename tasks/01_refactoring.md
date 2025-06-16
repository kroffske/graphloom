# Graph Visualization Refactoring: Separating React and D3 Concerns

## Problem Statement

The current implementation renders React components inside D3-managed DOM elements, causing "removeChild" errors when D3 manipulates the DOM during filtering operations. This happens because:

1. D3 directly removes SVG elements containing React roots
2. React still holds references to unmounted components
3. Multiple systems are trying to manage the same DOM nodes

## Solution Overview

Implement a clean separation between React and D3 layers using a portal-based architecture where:
- D3 manages only SVG elements for graph visualization
- React components render in a separate overlay layer
- Communication happens through events and callbacks
- Single source of truth for component lifecycle

## Phase 1: Analysis and Planning (Commit after completion)

### 1.1 Document Current Architecture
- [ ] Create detailed diagram of current component hierarchy
- [ ] Map all D3-React integration points
- [ ] List all files that mix D3 and React DOM manipulation
- [ ] Document data flow between layers

### 1.2 Identify Problem Areas
- [ ] Mark components that use createRoot inside D3 elements
- [ ] Find all places where D3 removes DOM nodes with React components
- [ ] List event handlers that cross boundaries
- [ ] Document state synchronization issues

### 1.3 Design New Architecture
- [ ] Create architecture diagram for separated layers
- [ ] Define clear API boundaries between React and D3
- [ ] Plan migration strategy for existing code
- [ ] Design event/message passing system

## Phase 2: Create Portal Infrastructure (Commit after completion)

### 2.1 Create Portal Container Components
- [ ] Create `GraphPortalProvider` component
- [ ] Implement `GraphNodePortal` for rendering nodes
- [ ] Add `GraphOverlayLayer` for React components
- [ ] Set up z-index layering strategy

### 2.2 Implement Positioning System
- [ ] Create position synchronization hook
- [ ] Implement transform tracking for D3 elements
- [ ] Add viewport-aware positioning logic
- [ ] Handle zoom/pan transformations

### 2.3 Set Up Event System
- [ ] Create event emitter for D3-React communication
- [ ] Implement node selection events
- [ ] Add hover state synchronization
- [ ] Handle drag events across layers

## Phase 3: Refactor Node Rendering (Commit after each component)

### 3.1 Refactor GraphD3NodeMount
- [ ] Remove direct createRoot usage
- [ ] Convert to portal-based rendering
- [ ] Update props to use node IDs instead of DOM refs
- [ ] Add position tracking

### 3.2 Update useD3SvgGraph Hook
- [ ] Remove React rendering from D3 code
- [ ] Keep only SVG manipulation
- [ ] Add event emissions for state changes
- [ ] Clean up root tracking code

### 3.3 Refactor GraphD3NodeLayer
- [ ] Convert to overlay rendering
- [ ] Remove foreignObject dependencies
- [ ] Update to use portal system
- [ ] Add proper cleanup logic

### 3.4 Update D3 Force Simulation
- [ ] Ensure simulation only updates data
- [ ] Remove DOM manipulation from tick handlers
- [ ] Add position update events
- [ ] Keep D3 focused on calculations only

## Phase 4: Update Event Handling (Commit after completion)

### 4.1 Refactor Mouse Events
- [ ] Move click handlers to React layer
- [ ] Synchronize hover states via events
- [ ] Update context menu handling
- [ ] Fix keyboard navigation

### 4.2 Update Drag Behavior
- [ ] Implement React-based drag handling
- [ ] Sync with D3 force simulation
- [ ] Update manual positioning logic
- [ ] Handle edge cases

### 4.3 Fix Selection System
- [ ] Move selection state to React
- [ ] Update visual feedback rendering
- [ ] Synchronize with D3 highlights
- [ ] Test multi-selection

## Phase 5: Testing and Cleanup (Commit after each section)

### 5.1 Update Tests
- [ ] Add tests for portal rendering
- [ ] Test event synchronization
- [ ] Verify no memory leaks
- [ ] Check performance metrics

### 5.2 Remove Old Code
- [ ] Delete unused root tracking maps
- [ ] Remove createRoot wrapper functions
- [ ] Clean up foreignObject usage
- [ ] Remove obsolete event handlers

### 5.3 Performance Optimization
- [ ] Implement render batching
- [ ] Add proper memoization
- [ ] Optimize re-render triggers
- [ ] Profile and fix bottlenecks

### 5.4 Documentation
- [ ] Update component documentation
- [ ] Add architecture diagrams
- [ ] Document new patterns
- [ ] Create migration guide

## Success Criteria

1. No "removeChild" errors during any operations
2. Clean separation between React and D3 code
3. Improved performance (measure before/after)
4. All existing features still working
5. Easier to maintain and extend

## Risk Mitigation

1. **Incremental Migration**: Implement alongside existing code first
2. **Feature Flags**: Add toggles to switch between old/new implementations
3. **Extensive Testing**: Test each phase thoroughly before moving on
4. **Rollback Plan**: Keep old code until new system is proven

## Technical Notes

### Portal Implementation Example
```typescript
// GraphPortalProvider.tsx
const GraphPortalProvider: React.FC = ({ children }) => {
  const [portals, setPortals] = useState<Map<string, ReactPortal>>();
  // ... portal management logic
};

// GraphNodePortal.tsx
const GraphNodePortal: React.FC<{ nodeId: string; position: Point }> = ({
  nodeId,
  position,
  children
}) => {
  return createPortal(
    <div style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
      {children}
    </div>,
    portalContainer
  );
};
```

### Event System Example
```typescript
// graphEvents.ts
export const graphEvents = new EventEmitter();

// D3 code
graphEvents.emit('nodePositionUpdate', { nodeId, x, y });

// React code
useEffect(() => {
  const handler = ({ nodeId, x, y }) => {
    updateNodePosition(nodeId, { x, y });
  };
  graphEvents.on('nodePositionUpdate', handler);
  return () => graphEvents.off('nodePositionUpdate', handler);
}, []);
```