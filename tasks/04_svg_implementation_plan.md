# SVG React Implementation Plan

Based on the technical review, we're proceeding with **Approach 1: Direct SVG Rendering**.

## Phase 1: Proof of Concept (Spike)

### 1.1 Create SVG Node Component

```typescript
// components/GraphNodeSvg.tsx
interface GraphNodeSvgProps {
  node: GraphNode;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onContextMenu: (id: string, event: React.MouseEvent) => void;
}

export const GraphNodeSvg = React.memo<GraphNodeSvgProps>(({
  node,
  isSelected,
  isHovered,
  onSelect,
  onContextMenu
}) => {
  const hitRadius = 40; // Larger hit target than visual
  
  return (
    <g className="graph-node-svg" role="button" tabIndex={0}>
      {/* Accessibility */}
      <title>{node.label}</title>
      <desc>{node.description || `Node ${node.id}`}</desc>
      
      {/* Invisible hit target */}
      <circle
        r={hitRadius}
        opacity={0}
        onClick={() => onSelect(node.id)}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu(node.id, e);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect(node.id);
          if (e.key === 'ContextMenu') onContextMenu(node.id, e);
        }}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Visual representation */}
      <circle
        r={36}
        fill={node.appearance?.backgroundColor || '#ffffff'}
        stroke={isSelected ? '#3b82f6' : '#e5e7eb'}
        strokeWidth={isSelected ? 3 : 1.5}
        vectorEffect="non-scaling-stroke"
        filter={isHovered ? 'url(#drop-shadow)' : undefined}
      />
      
      {/* Icon/Emoji */}
      {node.appearance?.icon && (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={24}
          fill={node.appearance?.color || '#374151'}
          pointerEvents="none"
        >
          {node.appearance.icon}
        </text>
      )}
      
      {/* Label - using foreignObject for multiline support */}
      <foreignObject
        x={-50}
        y={40}
        width={100}
        height={30}
        pointerEvents="none"
      >
        <div 
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#6b7280',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {node.label}
        </div>
      </foreignObject>
    </g>
  );
}, (prev, next) => {
  // Custom comparison for performance
  return (
    prev.node.id === next.node.id &&
    prev.node.label === next.node.label &&
    prev.node.appearance === next.node.appearance &&
    prev.isSelected === next.isSelected &&
    prev.isHovered === next.isHovered
  );
});
```

### 1.2 Edge Rendering Optimization

For performance with many edges, we'll render them as a single path:

```typescript
// components/GraphEdgeLayer.tsx
export const GraphEdgeLayer: React.FC<{ edges: Edge[], positions: Map<string, Point> }> = 
  React.memo(({ edges, positions }) => {
    // Batch edges into a single path for performance
    const edgePath = useMemo(() => {
      return edges.reduce((path, edge) => {
        const source = positions.get(edge.source);
        const target = positions.get(edge.target);
        if (!source || !target) return path;
        
        return path + `M${source.x},${source.y}L${target.x},${target.y}`;
      }, '');
    }, [edges, positions]);
    
    return (
      <g className="edge-layer">
        <path
          d={edgePath}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    );
  });
```

## Phase 2: Integration with D3

### 2.1 Modified D3 Hook

```typescript
// hooks/useD3SvgDirect.tsx
export function useD3SvgDirect({ nodes, edges, svgRef }) {
  const nodeRootsRef = useRef(new Map<string, Root>());
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const svgGroup = svg.append('g').attr('class', 'graph-content');
    
    // Add filter definitions
    const defs = svg.append('defs');
    defs.append('filter')
      .attr('id', 'drop-shadow')
      .html(`
        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
        <feOffset dx="0" dy="2" result="offsetblur"/>
        <feFlood flood-color="#000000" flood-opacity="0.1"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      `);
    
    // Single zoom handler for everything
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        svgGroup.attr('transform', event.transform);
        // Emit for any React state that needs to know
        graphEventBus.emit('transform:change', event.transform);
      });
    
    svg.call(zoom);
    
    // Node groups with stable React roots
    const nodeG = svgGroup.selectAll('.node')
      .data(nodes, d => d.id)
      .join(
        enter => {
          const g = enter.append('g').attr('class', 'node');
          
          // Mount React component once
          g.each(function(d) {
            const root = createRoot(this);
            nodeRootsRef.current.set(d.id, root);
            
            root.render(
              <GraphNodeSvg
                node={d}
                isSelected={false}
                isHovered={false}
                onSelect={handleNodeSelect}
                onContextMenu={handleNodeContextMenu}
              />
            );
          });
          
          return g;
        },
        update => update,
        exit => {
          // Clean up React roots
          exit.each(function(d) {
            const root = nodeRootsRef.current.get(d.id);
            if (root) {
              root.unmount();
              nodeRootsRef.current.delete(d.id);
            }
          });
          return exit.remove();
        }
      );
    
    // Position updates via RAF throttling
    let rafId: number;
    simulation.on('tick', () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        nodeG.attr('transform', d => `translate(${d.x},${d.y})`);
        // Update edge positions...
      });
    });
    
    return () => {
      cancelAnimationFrame(rafId);
      simulation.stop();
      // Cleanup roots...
    };
  }, [nodes, edges]);
}
```

## Phase 3: Performance Optimizations

### 3.1 Viewport Culling

Only render nodes visible in the viewport:

```typescript
function getVisibleNodes(nodes: Node[], transform: d3.ZoomTransform, viewBox: Box): Node[] {
  const { k, x, y } = transform;
  const visibleBox = {
    x: -x / k,
    y: -y / k,
    width: viewBox.width / k,
    height: viewBox.height / k
  };
  
  return nodes.filter(node => {
    const nodeBox = {
      x: node.x - 40,
      y: node.y - 40,
      width: 80,
      height: 80
    };
    
    return boxesIntersect(visibleBox, nodeBox);
  });
}
```

### 3.2 Edge Rasterization for Large Graphs

```typescript
// For > 1000 edges, render to canvas
const EdgeCanvas: React.FC<{ edges, positions, transform }> = ({ edges, positions, transform }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transform
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);
    
    // Draw edges
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2 / transform.k; // Compensate for zoom
    
    edges.forEach(edge => {
      const source = positions.get(edge.source);
      const target = positions.get(edge.target);
      if (!source || !target) return;
      
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    });
    
    ctx.restore();
  }, [edges, positions, transform]);
  
  return <canvas ref={canvasRef} width={900} height={530} style={{ position: 'absolute' }} />;
};
```

## Phase 4: HTML Overlays for Rich Content

### 4.1 Tooltip System

```typescript
// components/GraphTooltip.tsx
export const GraphTooltip: React.FC<{ anchor: SVGElement, node: Node }> = ({ anchor, node }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if (!anchor) return;
    
    const updatePosition = () => {
      const svg = anchor.ownerSVGElement;
      if (!svg) return;
      
      // Convert SVG point to screen coordinates
      const pt = svg.createSVGPoint();
      pt.x = node.x;
      pt.y = node.y;
      
      const screenPt = pt.matrixTransform(svg.getScreenCTM());
      setPosition({ x: screenPt.x, y: screenPt.y });
    };
    
    updatePosition();
    
    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [anchor, node]);
  
  return createPortal(
    <div
      className="graph-tooltip"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y - 60,
        transform: 'translateX(-50%)',
        // Rich HTML content here
      }}
    >
      <h3>{node.label}</h3>
      <p>{node.description}</p>
      {/* Any complex HTML/React content */}
    </div>,
    document.body
  );
};
```

## Phase 5: Migration Steps

1. **Week 1**: Implement GraphNodeSvg and test with 50 nodes
2. **Week 2**: Add edge rendering and performance optimizations
3. **Week 3**: Implement interactions (drag, select, context menu)
4. **Week 4**: Add HTML overlays for tooltips and complex UI
5. **Week 5**: Performance testing and optimization
6. **Week 6**: Complete migration and remove portal infrastructure

## Success Metrics

- [ ] Frame time < 8ms during pan/zoom (60 FPS)
- [ ] No coordinate system misalignment
- [ ] Memory usage < 100MB for 1000 nodes
- [ ] Zero "removeChild" errors
- [ ] Accessibility score > 90

## Rollback Plan

Keep the current implementation behind a feature flag until the new system is proven stable:

```typescript
const GraphCanvas = () => {
  const useSvgDirect = useFeatureFlag('USE_SVG_DIRECT');
  
  if (useSvgDirect) {
    return <GraphCanvasSvg />;
  } else {
    return <GraphCanvasLegacy />;
  }
};
```