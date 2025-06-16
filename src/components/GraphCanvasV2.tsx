import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useGraphStore } from '@/state/useGraphStore';
import { GraphNodeV2 } from './GraphNodeV2';

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
    let tickCount = 0;
    const updatePositions = () => {
      nodes.forEach(node => {
        if (typeof node.x === 'number' && typeof node.y === 'number') {
          positionsRef.current.set(node.id, { x: node.x, y: node.y });
        }
      });
      
      // Update React state at 30fps max
      tickCount++;
      if (tickCount % 2 === 0) {
        setPositionsVersion(v => v + 1);
      }
    };
    
    simulation.on('tick', () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePositions);
    });
    
    // Stop simulation after initial layout
    simulation.alpha(0.3).restart();
    
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
    
    // Prevent double-click zoom
    d3.select(svgRef.current).on('dblclick.zoom', null);
  }, []);
  
  // Handle node drag
  const handleNodeDrag = useCallback((nodeId: string, dx: number, dy: number, type: 'start' | 'drag' | 'end') => {
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
      // Update position immediately for smooth dragging
      positionsRef.current.set(nodeId, { x: dx, y: dy });
      setPositionsVersion(v => v + 1);
    } else if (type === 'end') {
      simulation.alphaTarget(0);
      node.fx = null;
      node.fy = null;
    }
  }, [nodes]);
  
  // Get current positions
  const positions = positionsRef.current;
  
  return (
    <svg 
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 900 530"
      style={{ background: '#f9fafb', cursor: 'grab' }}
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
                onDrag={handleNodeDrag}
              />
            );
          })}
        </g>
      </g>
    </svg>
  );
};