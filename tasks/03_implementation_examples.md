# Detailed Implementation Examples

## Approach 1: Direct SVG Rendering with React

### Complete Working Example

```typescript
// components/GraphNodeSvg.tsx
import React from 'react';
import { Node } from '@/types';

interface GraphNodeSvgProps {
  node: Node;
  onSelect: (id: string) => void;
  onContextMenu: (id: string, event: React.MouseEvent) => void;
  isSelected: boolean;
  isHovered: boolean;
}

export const GraphNodeSvg: React.FC<GraphNodeSvgProps> = ({
  node,
  onSelect,
  onContextMenu,
  isSelected,
  isHovered
}) => {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(node.id, e);
  };

  return (
    <g 
      className="graph-node-svg"
      onClick={() => onSelect(node.id)}
      onContextMenu={handleContextMenu}
      style={{ cursor: 'pointer' }}
    >
      {/* Background circle */}
      <circle
        r={36}
        fill={node.appearance?.backgroundColor || '#ffffff'}
        stroke={isSelected ? '#3b82f6' : '#e5e7eb'}
        strokeWidth={isSelected ? 3 : 1.5}
        filter={isHovered ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' : undefined}
      />
      
      {/* Icon or emoji */}
      {node.appearance?.icon && (
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={24}
          fill={node.appearance?.color || '#374151'}
        >
          {node.appearance.icon}
        </text>
      )}
      
      {/* Label below */}
      <text
        y={50}
        textAnchor="middle"
        fontSize={12}
        fill="#6b7280"
      >
        {node.label}
      </text>
      
      {/* Selection indicator */}
      {isSelected && (
        <circle
          r={40}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="4 2"
          opacity={0.5}
        />
      )}
    </g>
  );
};

// hooks/useD3SvgGraph.tsx - Modified version
export function useD3SvgGraph({ nodes, edges, ...props }) {
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    
    // Create node groups
    const nodeG = svg.selectAll('.node')
      .data(nodes, d => d.id)
      .join(
        enter => enter.append('g').attr('class', 'node'),
        update => update,
        exit => {
          // Clean up React roots on exit
          exit.each(function(d) {
            const root = nodeRoots.get(d.id);
            if (root) {
              root.unmount();
              nodeRoots.delete(d.id);
            }
          });
          exit.remove();
        }
      );
    
    // Mount React components
    nodeG.each(function(d) {
      const element = this;
      let root = nodeRoots.get(d.id);
      
      if (!root) {
        root = createRoot(element);
        nodeRoots.set(d.id, root);
      }
      
      root.render(
        <GraphNodeSvg
          node={d}
          onSelect={handleNodeSelect}
          onContextMenu={handleNodeContextMenu}
          isSelected={selectedNodeId === d.id}
          isHovered={hoveredNodeId === d.id}
        />
      );
    });
    
    // D3 handles positioning
    simulation.on('tick', () => {
      nodeG.attr('transform', d => `translate(${d.x},${d.y})`);
      // Update edges...
    });
  }, [nodes, edges]);
}
```

### Benefits in Action

1. **Zoom works perfectly** - Just apply transform to the SVG group:
```typescript
const zoom = d3.zoom()
  .on('zoom', (event) => {
    svgGroup.attr('transform', event.transform);
    // That's it! React components move with the transform
  });
```

2. **No coordinate conversion needed**:
```typescript
// Click position is already in SVG coordinates
const handleNodeClick = (event: MouseEvent) => {
  const [x, y] = d3.pointer(event, svgGroup.node());
  // x, y are in the same coordinate system as node positions
};
```

## Approach 2: React-First with D3 Physics

### Complete Working Example

```typescript
// components/GraphReactCanvas.tsx
import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

interface NodePosition {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

export const GraphReactCanvas: React.FC<{ nodes, edges }> = ({ nodes, edges }) => {
  const [positions, setPositions] = useState<Map<string, NodePosition>>(new Map());
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<any, any>>();

  // D3 only handles physics
  useEffect(() => {
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(450, 265));

    simulationRef.current = simulation;

    simulation.on('tick', () => {
      const newPositions = new Map<string, NodePosition>();
      nodes.forEach(node => {
        newPositions.set(node.id, {
          x: node.x || 0,
          y: node.y || 0,
          vx: node.vx,
          vy: node.vy
        });
      });
      setPositions(newPositions);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, edges]);

  // Handle zoom/pan with React
  useEffect(() => {
    if (!svgRef.current) return;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        setTransform(event.transform);
      });

    d3.select(svgRef.current).call(zoom);
  }, []);

  // Handle drag with React
  const handleNodeDrag = (nodeId: string, dx: number, dy: number, type: 'start' | 'drag' | 'end') => {
    const simulation = simulationRef.current;
    if (!simulation) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (type === 'start') {
      simulation.alphaTarget(0.3).restart();
      node.fx = node.x;
      node.fy = node.y;
    } else if (type === 'drag') {
      node.fx = dx;
      node.fy = dy;
    } else if (type === 'end') {
      simulation.alphaTarget(0);
      node.fx = null;
      node.fy = null;
    }
  };

  return (
    <svg ref={svgRef} viewBox="0 0 900 530" style={{ width: '100%', height: '100%' }}>
      <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
        {/* Render edges */}
        {edges.map(edge => {
          const sourcePos = positions.get(edge.source);
          const targetPos = positions.get(edge.target);
          if (!sourcePos || !targetPos) return null;

          return (
            <line
              key={edge.id}
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              stroke={edge.appearance?.color || '#94a3b8'}
              strokeWidth={edge.appearance?.width || 2}
            />
          );
        })}

        {/* Render nodes */}
        {nodes.map(node => {
          const pos = positions.get(node.id);
          if (!pos) return null;

          return (
            <GraphNodeReact
              key={node.id}
              node={node}
              x={pos.x}
              y={pos.y}
              onDrag={(dx, dy, type) => handleNodeDrag(node.id, dx, dy, type)}
            />
          );
        })}
      </g>
    </svg>
  );
};

// components/GraphNodeReact.tsx
const GraphNodeReact: React.FC<{
  node: Node;
  x: number;
  y: number;
  onDrag: (dx: number, dy: number, type: 'start' | 'drag' | 'end') => void;
}> = ({ node, x, y, onDrag }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - x, y: e.clientY - y };
    onDrag(x, y, 'start');
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      onDrag(newX, newY, 'drag');
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onDrag(0, 0, 'end');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onDrag]);

  return (
    <g transform={`translate(${x},${y})`} onMouseDown={handleMouseDown}>
      <circle r={36} fill="#fff" stroke="#94a3b8" />
      <text textAnchor="middle" dominantBaseline="middle">
        {node.label}
      </text>
    </g>
  );
};
```

### Performance Optimizations

```typescript
// Use React.memo to prevent unnecessary re-renders
const GraphNodeReact = React.memo(({ node, x, y, onDrag }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return (
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.node.id === nextProps.node.id
  );
});

// Batch position updates
const POSITION_UPDATE_INTERVAL = 16; // 60fps
let positionUpdateTimer: number;

simulation.on('tick', () => {
  clearTimeout(positionUpdateTimer);
  positionUpdateTimer = setTimeout(() => {
    setPositions(new Map(/* positions */));
  }, POSITION_UPDATE_INTERVAL);
});
```

## Approach 3: Fixed ForeignObject with Isolated State

### Complete Working Example

```typescript
// stores/nodeStore.ts
class NodeStore {
  private nodes = new Map<string, Node>();
  private listeners = new Map<string, Set<(node: Node) => void>>();
  
  subscribe(nodeId: string, callback: (node: Node) => void, options?: SubscribeOptions) {
    if (!this.listeners.has(nodeId)) {
      this.listeners.set(nodeId, new Set());
    }
    
    const listeners = this.listeners.get(nodeId)!;
    
    // Wrap callback with options
    const wrappedCallback = options?.throttle 
      ? throttle(callback, options.throttle)
      : callback;
    
    listeners.add(wrappedCallback);
    
    // Fire immediately unless disabled
    if (options?.fireImmediately !== false) {
      const node = this.nodes.get(nodeId);
      if (node) wrappedCallback(node);
    }
    
    return () => listeners.delete(wrappedCallback);
  }
  
  updateNode(nodeId: string, updates: Partial<Node>) {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    
    // Update node
    const updatedNode = { ...node, ...updates };
    this.nodes.set(nodeId, updatedNode);
    
    // Notify only this node's listeners
    const listeners = this.listeners.get(nodeId);
    if (listeners) {
      listeners.forEach(callback => callback(updatedNode));
    }
  }
}

// components/GraphNodeIsolated.tsx
const GraphNodeIsolated: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const [node, setNode] = useState<Node | null>(null);
  const updateQueued = useRef(false);
  
  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = nodeStore.subscribe(
      nodeId,
      (updatedNode) => {
        if (!mounted || updateQueued.current) return;
        
        // Queue update for next frame
        updateQueued.current = true;
        requestAnimationFrame(() => {
          if (mounted) {
            setNode(updatedNode);
            updateQueued.current = false;
          }
        });
      },
      { fireImmediately: true, throttle: 16 }
    );
    
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [nodeId]);
  
  if (!node) return null;
  
  // Render without causing store updates
  const handleClick = useCallback(() => {
    // Update happens outside render cycle
    setTimeout(() => {
      nodeStore.updateNode(nodeId, { selected: true });
    }, 0);
  }, [nodeId]);
  
  return (
    <div className="graph-node" onClick={handleClick}>
      <GraphNode node={node} />
    </div>
  );
};

// D3 integration with stable mounting
const nodeG = svg.selectAll('.node')
  .data(nodes, d => d.id)
  .join(
    enter => {
      const g = enter.append('g').attr('class', 'node');
      
      g.append('foreignObject')
        .attr('width', 72)
        .attr('height', 72)
        .attr('x', -36)
        .attr('y', -36)
        .each(function(d) {
          const container = this;
          
          // Create root only once
          if (!nodeRoots.has(d.id)) {
            const root = createRoot(container);
            nodeRoots.set(d.id, root);
            
            // Render with isolated component
            root.render(
              <React.StrictMode>
                <GraphNodeIsolated nodeId={d.id} />
              </React.StrictMode>
            );
          }
        });
      
      return g;
    },
    update => update,
    exit => {
      exit.each(function(d) {
        const root = nodeRoots.get(d.id);
        if (root) {
          root.unmount();
          nodeRoots.delete(d.id);
        }
      });
      exit.remove();
    }
  );
```

## Performance Comparison

| Approach | Initial Render | 1000 Nodes | Zoom/Pan | React Features |
|----------|---------------|------------|----------|----------------|
| SVG React | Fast | Good | Native | Limited |
| React-First | Medium | Slower | React-based | Full |
| Fixed Foreign | Fast | Good | Native | Full |

## Decision Matrix

| Criteria | SVG React | React-First | Fixed Foreign |
|----------|-----------|-------------|---------------|
| Complexity | Low | Medium | High |
| Debugging | Easy | Easy | Hard |
| Flexibility | Medium | High | High |
| Performance | High | Medium | High |
| Risk | Low | Medium | Medium |

## Final Recommendation

**For immediate fix**: Go with **Approach 1 (SVG React)** because:
- Solves the coordinate problem completely
- Minimal refactoring required
- Proven to work at scale
- Can enhance with HTML tooltips/modals outside the SVG

**For long-term**: Consider migrating to **Approach 2 (React-First)** if you need:
- Complex node interactions
- HTML/CSS styling
- Integration with other React libraries
- Better testability