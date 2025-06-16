# MVP Implementation: Neo4j Bloom-style Graph Explorer

## Goals
- Interactive graph analysis tool for 5k-10k nodes
- Fast MVP delivery with React developer experience
- Smooth zoom/pan/select interactions
- Rich node visualization (icons, labels, tooltips)

## Architecture: React-First + D3 Physics

### Why This Approach for MVP
1. **Fast development** - React handles all UI logic naturally
2. **No coordinate sync issues** - Single SVG transform
3. **D3's proven physics** - Quality force-directed layouts
4. **Easy iteration** - Add features without refactoring
5. **Manageable performance** - Works well up to 10k nodes with optimizations

## Implementation Plan

### Phase 1: Core Graph Canvas (Week 1)

```typescript
// components/GraphCanvasV2.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useGraphStore } from '@/state/useGraphStore';

interface Transform {
  k: number;
  x: number; 
  y: number;
}

export const GraphCanvasV2: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const simulationRef = useRef<d3.Simulation<any, any>>();
  
  // Single transform state for zoom/pan
  const [transform, setTransform] = useState<Transform>({ k: 1, x: 0, y: 0 });
  
  // Node positions in ref to avoid re-renders on every tick
  const positionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [positionsVersion, setPositionsVersion] = useState(0);
  
  // Get graph data from store
  const nodes = useGraphStore(state => state.nodes);
  const edges = useGraphStore(state => state.edges);
  
  // Initialize D3 simulation
  useEffect(() => {
    if (!nodes.length) return;
    
    // Create simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(450, 265))
      .force('collision', d3.forceCollide().radius(50));
    
    simulationRef.current = simulation;
    
    // Throttled position updates
    let rafId: number;
    const updatePositions = () => {
      nodes.forEach(node => {
        if (typeof node.x === 'number' && typeof node.y === 'number') {
          positionsRef.current.set(node.id, { x: node.x, y: node.y });
        }
      });
      // Trigger re-render at 30fps max
      setPositionsVersion(v => v + 1);
    };
    
    simulation.on('tick', () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePositions);
    });
    
    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      simulation.stop();
    };
  }, [nodes, edges]);
  
  // Setup zoom behavior
  useEffect(() => {
    if (!svgRef.current) return;
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        setTransform(event.transform);
      });
    
    d3.select(svgRef.current).call(zoom);
  }, []);
  
  // Get current positions
  const positions = positionsRef.current;
  
  return (
    <svg 
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 900 530"
      style={{ background: '#f9fafb' }}
    >
      <g 
        ref={gRef}
        transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
      >
        {/* Render edges first (behind nodes) */}
        <g className="edges">
          {edges.map(edge => {
            const source = positions.get(edge.source);
            const target = positions.get(edge.target);
            if (!source || !target) return null;
            
            return (
              <line
                key={edge.id}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={edge.appearance?.color || '#cbd5e1'}
                strokeWidth={edge.appearance?.width || 1}
                opacity={0.6}
              />
            );
          })}
        </g>
        
        {/* Render nodes */}
        <g className="nodes">
          {nodes.map(node => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            
            return (
              <GraphNodeV2
                key={node.id}
                node={node}
                x={pos.x}
                y={pos.y}
                transform={transform}
              />
            );
          })}
        </g>
      </g>
    </svg>
  );
};
```

### Phase 2: Optimized Node Component (Week 1)

```typescript
// components/GraphNodeV2.tsx
import React from 'react';
import { GraphNode } from '@/types';

interface GraphNodeV2Props {
  node: GraphNode;
  x: number;
  y: number;
  transform: { k: number; x: number; y: number };
}

// Memoize to prevent unnecessary re-renders
export const GraphNodeV2 = React.memo<GraphNodeV2Props>(({ 
  node, 
  x, 
  y, 
  transform 
}) => {
  const selectedNodeId = useGraphStore(state => state.selectedNodeId);
  const hoveredNodeId = useGraphStore(state => state.hoveredNodeId);
  const selectNode = useGraphStore(state => state.selectNode);
  const setHoveredNodeId = useGraphStore(state => state.setHoveredNodeId);
  
  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  
  // Hide labels when zoomed out
  const showLabel = transform.k > 0.6;
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
  }, [node.id, selectNode]);
  
  const handleMouseEnter = useCallback(() => {
    setHoveredNodeId(node.id);
  }, [node.id, setHoveredNodeId]);
  
  const handleMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, [setHoveredNodeId]);
  
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Background circle */}
      <circle
        r={36}
        fill={node.appearance?.backgroundColor || '#ffffff'}
        stroke={isSelected ? '#3b82f6' : '#e5e7eb'}
        strokeWidth={isSelected ? 3 : 1.5}
        style={{ 
          cursor: 'pointer',
          filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' : undefined
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Icon/Emoji */}
      {node.appearance?.icon && (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={24}
          fill={node.appearance?.color || '#374151'}
          pointerEvents="none"
          style={{ userSelect: 'none' }}
        >
          {node.appearance.icon}
        </text>
      )}
      
      {/* Label (hidden when zoomed out) */}
      {showLabel && (
        <text
          y={50}
          textAnchor="middle"
          fontSize={12}
          fill="#6b7280"
          pointerEvents="none"
          style={{ userSelect: 'none' }}
        >
          {node.label}
        </text>
      )}
    </g>
  );
}, (prev, next) => {
  // Custom comparison for performance
  return (
    prev.node === next.node &&
    prev.x === next.x &&
    prev.y === next.y &&
    prev.transform.k === next.transform.k
  );
});
```

### Phase 3: Performance Optimizations (Week 2)

#### 3.1 Canvas Layer for Edges (Optional)

```typescript
// components/EdgeCanvasLayer.tsx
export const EdgeCanvasLayer: React.FC<{
  edges: Edge[];
  positions: Map<string, Point>;
  transform: Transform;
}> = ({ edges, positions, transform }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transform
    ctx.save();
    const { k, x, y } = transform;
    ctx.translate(x + canvas.width/2, y + canvas.height/2);
    ctx.scale(k, k);
    ctx.translate(-450, -265); // Center point
    
    // Batch render all edges
    ctx.strokeStyle = '#cbd5e1';
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    edges.forEach(edge => {
      const source = positions.get(edge.source);
      const target = positions.get(edge.target);
      if (!source || !target) return;
      
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
    });
    ctx.stroke();
    
    ctx.restore();
  }, [edges, positions, transform]);
  
  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={530}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none'
      }}
    />
  );
};
```

#### 3.2 Viewport Culling

```typescript
function useVisibleNodes(nodes: Node[], positions: Map<string, Point>, transform: Transform) {
  return useMemo(() => {
    const { k, x, y } = transform;
    const padding = 100; // Extra padding for smooth scrolling
    
    // Calculate visible bounds in graph coordinates
    const bounds = {
      left: (-x - padding) / k,
      right: (-x + 900 + padding) / k,
      top: (-y - padding) / k,
      bottom: (-y + 530 + padding) / k
    };
    
    return nodes.filter(node => {
      const pos = positions.get(node.id);
      if (!pos) return false;
      
      return (
        pos.x >= bounds.left &&
        pos.x <= bounds.right &&
        pos.y >= bounds.top &&
        pos.y <= bounds.bottom
      );
    });
  }, [nodes, positions, transform]);
}
```

### Phase 4: Rich Interactions (Week 2)

#### 4.1 Tooltips with Portals

```typescript
// components/NodeTooltip.tsx
export const NodeTooltip: React.FC<{ node: Node; x: number; y: number }> = ({ 
  node, 
  x, 
  y 
}) => {
  const svgRef = useGraphCanvasContext();
  const [screenPos, setScreenPos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const updatePosition = () => {
      const svg = svgRef.current!;
      const pt = svg.createSVGPoint();
      pt.x = x;
      pt.y = y;
      
      const screenPt = pt.matrixTransform(svg.getScreenCTM()!);
      setScreenPos({ x: screenPt.x, y: screenPt.y - 60 });
    };
    
    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [x, y]);
  
  return createPortal(
    <div
      className="absolute bg-white rounded-lg shadow-lg p-4 z-50"
      style={{
        left: screenPos.x,
        top: screenPos.y,
        transform: 'translateX(-50%)'
      }}
    >
      <h3 className="font-semibold">{node.label}</h3>
      <div className="text-sm text-gray-600 mt-2">
        <p>Type: {node.type}</p>
        <p>ID: {node.id}</p>
        {node.attributes && (
          <div className="mt-2">
            {Object.entries(node.attributes).map(([key, value]) => (
              <p key={key}>{key}: {String(value)}</p>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
```

### Phase 5: Testing with Synthetic Data (Week 3)

```typescript
// utils/generateTestGraph.ts
export function generateTestGraph(nodeCount: number = 5000) {
  const nodes: GraphNode[] = [];
  const edges: Edge[] = [];
  
  // Generate nodes
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: `node-${i}`,
      type: ['person', 'company', 'product'][i % 3],
      label: `Node ${i}`,
      appearance: {
        icon: ['👤', '🏢', '📦'][i % 3],
        backgroundColor: ['#dbeafe', '#fef3c7', '#d1fae5'][i % 3],
        color: ['#1e40af', '#92400e', '#065f46'][i % 3]
      },
      attributes: {
        created: new Date().toISOString(),
        weight: Math.random() * 100
      }
    });
  }
  
  // Generate edges (sparse graph, ~2 edges per node)
  for (let i = 0; i < nodeCount * 2; i++) {
    const source = Math.floor(Math.random() * nodeCount);
    const target = Math.floor(Math.random() * nodeCount);
    
    if (source !== target) {
      edges.push({
        id: `edge-${i}`,
        source: `node-${source}`,
        target: `node-${target}`,
        type: 'CONNECTED_TO',
        appearance: {
          color: '#94a3b8',
          width: 1
        }
      });
    }
  }
  
  return { nodes, edges };
}
```

## Migration Path

1. **Week 1**: Implement core GraphCanvasV2 with basic rendering
2. **Week 2**: Add performance optimizations and interactions
3. **Week 3**: Test with 5k-10k nodes, profile and optimize
4. **Week 4**: Add graph analysis features (expand, filter, search)
5. **Week 5**: Polish UI and add Bloom-style controls

## Success Metrics

- [ ] 60 FPS pan/zoom with 5k nodes
- [ ] < 16ms React render time
- [ ] < 100ms layout stabilization
- [ ] Smooth node selection/hover
- [ ] No jank during graph updates

## Future Optimizations

When you need more performance:
1. Move to WebGL (Pixi.js) for 50k+ nodes
2. Implement graph virtualization
3. Add WebWorker for physics
4. Stream data from Neo4j