# New Architecture Design: Clean React-D3 Separation

## Overview

Separate React and D3 into independent layers that communicate via events and data, not DOM manipulation.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    GraphD3Canvas                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │              GraphPortalProvider                 │   │
│  │  ┌─────────────────┐  ┌────────────────────┐   │   │
│  │  │   D3 SVG Layer  │  │  React Overlay     │   │   │
│  │  │                 │  │                    │   │   │
│  │  │  ┌───────────┐  │  │  ┌─────────────┐  │   │   │
│  │  │  │   Edges   │  │  │  │ Node Portal │  │   │   │
│  │  │  └───────────┘  │  │  └─────────────┘  │   │   │
│  │  │  ┌───────────┐  │  │  ┌─────────────┐  │   │   │
│  │  │  │  Circles  │  │  │  │ Edge Labels │  │   │   │
│  │  │  └───────────┘  │  │  └─────────────┘  │   │   │
│  │  │                 │  │                    │   │   │
│  │  └─────────────────┘  └────────────────────┘   │   │
│  │                                                  │   │
│  │  Event Bus: position, selection, hover, drag    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### D3 SVG Layer
- Renders SVG edges (lines)
- Renders node circles (visual indicators)
- Handles force simulation calculations
- Manages zoom/pan transforms
- Emits position update events

### React Overlay Layer
- Renders node content via portals
- Renders edge labels via portals
- Handles user interactions
- Manages selection state
- Responds to position events

### Event Bus
- Coordinates between layers
- Maintains single source of truth
- Handles async updates
- Provides debugging capabilities

## Component Structure

```typescript
// GraphPortalProvider.tsx
interface GraphPortalContextValue {
  registerPortal: (id: string, element: React.ReactElement) => void;
  unregisterPortal: (id: string) => void;
  updatePortalPosition: (id: string, position: Point) => void;
}

// GraphD3Layer.tsx
const GraphD3Layer: React.FC = () => {
  // Only SVG rendering, no React components
  // Emits events for positions, interactions
};

// GraphReactOverlay.tsx
const GraphReactOverlay: React.FC = () => {
  // Renders all React components
  // Listens to position events
  // Handles user interactions
};

// GraphNodePortal.tsx
const GraphNodePortal: React.FC<{
  nodeId: string;
  position: Point;
  node: GraphNode;
}> = ({ nodeId, position, node }) => {
  return createPortal(
    <div
      style={{
        position: 'absolute',
        transform: `translate(${position.x}px, ${position.y}px)`,
        pointerEvents: 'auto',
      }}
    >
      <GraphNode data={node} />
    </div>,
    overlayContainer
  );
};
```

## Event System Design

```typescript
// graphEventBus.ts
export interface GraphEvents {
  'node:position': { nodeId: string; x: number; y: number };
  'node:dragstart': { nodeId: string };
  'node:dragend': { nodeId: string; x: number; y: number };
  'node:hover': { nodeId: string | null };
  'node:select': { nodeId: string };
  'edge:hover': { edgeId: string | null };
  'edge:select': { edgeId: string };
  'transform:change': { k: number; x: number; y: number };
}

class GraphEventBus extends EventEmitter {
  emit<K extends keyof GraphEvents>(
    event: K,
    data: GraphEvents[K]
  ): void;
  
  on<K extends keyof GraphEvents>(
    event: K,
    handler: (data: GraphEvents[K]) => void
  ): void;
}

export const graphEventBus = new GraphEventBus();
```

## Position Synchronization

```typescript
// useNodePositions.ts
export const useNodePositions = () => {
  const [positions, setPositions] = useState<Map<string, Point>>();
  
  useEffect(() => {
    const handlePositionUpdate = ({ nodeId, x, y }: GraphEvents['node:position']) => {
      setPositions(prev => new Map(prev).set(nodeId, { x, y }));
    };
    
    graphEventBus.on('node:position', handlePositionUpdate);
    return () => graphEventBus.off('node:position', handlePositionUpdate);
  }, []);
  
  return positions;
};
```

## Migration Path

### Step 1: Create Infrastructure
1. Implement `GraphPortalProvider`
2. Create `graphEventBus`
3. Add `GraphReactOverlay` container

### Step 2: Update D3 Layer
1. Remove all `createRoot` calls
2. Remove `foreignObject` elements
3. Add event emissions for positions

### Step 3: Implement React Overlay
1. Create `GraphNodePortal` component
2. Add position synchronization
3. Move event handlers to React

### Step 4: Test and Validate
1. Verify no removeChild errors
2. Check performance metrics
3. Ensure feature parity

## Benefits

1. **Clean Separation**: Each library handles what it does best
2. **No DOM Conflicts**: React and D3 never touch the same elements
3. **Better Performance**: React can optimize rendering independently
4. **Easier Testing**: Layers can be tested in isolation
5. **More Maintainable**: Clear boundaries and responsibilities

## Implementation Priority

1. **High Priority**: Node rendering (main source of errors)
2. **Medium Priority**: Event handling synchronization
3. **Low Priority**: Edge labels and tooltips

## Success Criteria

- Zero removeChild errors during any operation
- Performance equal or better than current
- All interactions working correctly
- Clean, understandable code structure
- Easy to extend with new features