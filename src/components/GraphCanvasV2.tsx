import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useGraphStore } from '@/state/useGraphStore';
import { GraphNodeV2 } from './GraphNodeV2';
import { graphEventBus } from '@/lib/graphEventBus';
import { LayoutSelector, LayoutType } from './LayoutSelector';
import { 
  ForceAtlas2Layout,
  OpenOrdLayout,
  applyCircleLayout,
  applyHierarchyLayout,
  applyRadialLayout
} from '@/utils/layouts';

interface Transform {
  k: number;
  x: number; 
  y: number;
}

export const GraphCanvasV2: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const simulationRef = useRef<d3.Simulation<any, any>>();
  const forceAtlas2Ref = useRef<ForceAtlas2Layout>();
  const openOrdRef = useRef<OpenOrdLayout>();
  const animationFrameRef = useRef<number>();
  
  // Layout state
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('force');
  
  // Single transform state for zoom/pan
  const [transform, setTransform] = useState<Transform>({ k: 1, x: 0, y: 0 });
  
  // Node positions in ref to avoid re-renders on every tick
  const positionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [positionsVersion, setPositionsVersion] = useState(0);
  
  // Get graph data from store
  const nodes = useGraphStore(state => state.nodes);
  const edges = useGraphStore(state => state.edges);
  
  // Initialize layout based on current type
  useEffect(() => {
    if (!nodes.length) return;
    
    // Stop any existing animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (simulationRef.current) {
      simulationRef.current.stop();
    }
    if (forceAtlas2Ref.current) {
      forceAtlas2Ref.current.stop();
    }
    if (openOrdRef.current) {
      openOrdRef.current.stop();
    }
    
    // Copy nodes to avoid mutating the store
    const simNodes = nodes.map(n => ({ ...n }));
    const simEdges = edges.map(e => ({ ...e }));
    
    // Initialize positions if needed
    simNodes.forEach(node => {
      const existing = positionsRef.current.get(node.id);
      if (existing) {
        node.x = existing.x;
        node.y = existing.y;
      } else {
        node.x = node.x || Math.random() * 900;
        node.y = node.y || Math.random() * 530;
      }
    });
    
    let tickCount = 0;
    const updatePositions = () => {
      simNodes.forEach(node => {
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
    
    switch (currentLayout) {
      case 'force': {
        // D3 Force Layout
        const simulation = d3.forceSimulation(simNodes)
          .force('link', d3.forceLink(simEdges).id((d: any) => d.id).distance(100).strength(1))
          .force('charge', d3.forceManyBody().strength(-400))
          .force('center', d3.forceCenter(450, 265))
          .force('collision', d3.forceCollide().radius(40))
          .velocityDecay(0.4)
          .alphaDecay(0.02);
        
        simulationRef.current = simulation;
        
        simulation.on('tick', () => {
          updatePositions();
        });
        
        simulation.alpha(0.3).restart();
        break;
      }
      
      case 'forceatlas2': {
        // ForceAtlas2 Layout
        const fa2 = new ForceAtlas2Layout(simNodes, simEdges, {
          gravity: 1.0,
          scalingRatio: 2.0,
          barnesHut: true,
          linLogMode: false,
          preventOverlap: true
        });
        
        forceAtlas2Ref.current = fa2;
        fa2.start();
        
        const animate = () => {
          fa2.tick();
          updatePositions();
          
          if (fa2.isRunning()) {
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        };
        
        animate();
        
        // Stop after some iterations
        setTimeout(() => fa2.stop(), 5000);
        break;
      }
      
      case 'openord': {
        // OpenOrd Layout
        const openOrd = new OpenOrdLayout(simNodes, simEdges, {
          stages: {
            liquid: { iterations: 100, temperature: 0.2, attraction: 2.0, damping: 0.9 },
            expansion: { iterations: 100, temperature: 0.15, attraction: 10.0, damping: 0.85 },
            cooldown: { iterations: 100, temperature: 0.1, attraction: 1.0, damping: 0.8 },
            crunch: { iterations: 50, temperature: 0.05, attraction: 10.0, damping: 0.75 },
            simmer: { iterations: 25, temperature: 0.01, attraction: 1.0, damping: 0.7 },
          },
          preventOverlap: true
        });
        
        openOrdRef.current = openOrd;
        openOrd.start();
        
        const animateOpenOrd = () => {
          openOrd.tick();
          updatePositions();
          
          if (openOrd.isRunning()) {
            animationFrameRef.current = requestAnimationFrame(animateOpenOrd);
          }
        };
        
        animateOpenOrd();
        break;
      }
      
      case 'circle': {
        // Circle Layout
        applyCircleLayout(simNodes, {
          center: [450, 265],
          radius: 200
        });
        updatePositions();
        break;
      }
      
      case 'hierarchy': {
        // Hierarchy Layout
        applyHierarchyLayout(simNodes, simEdges, {
          width: 900,
          height: 530
        });
        updatePositions();
        break;
      }
      
      case 'radial': {
        // Radial Layout
        applyRadialLayout(simNodes, simEdges, {
          center: [450, 265],
          radius: 200
        });
        updatePositions();
        break;
      }
    }
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
      if (forceAtlas2Ref.current) {
        forceAtlas2Ref.current.stop();
      }
      if (openOrdRef.current) {
        openOrdRef.current.stop();
      }
    };
  }, [nodes, edges, currentLayout]);
  
  // Setup zoom behavior
  useEffect(() => {
    if (!svgRef.current) return;
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .filter((event) => {
        // Allow zoom on wheel events
        if (event.type === 'wheel') return true;
        
        // Allow keyboard shortcuts
        if (event.type !== 'mousedown') return true;
        
        // For mouse events, check if we're clicking on a node
        const target = event.target as Element;
        // Check if the target or any parent is part of a node
        const isNode = target.closest('circle') || target.closest('.graph-node-svg');
        
        // Only allow pan if not clicking on a node
        return !isNode;
      })
      .on('zoom', (event) => {
        setTransform(event.transform);
      });
    
    d3.select(svgRef.current).call(zoom);
    
    // Prevent double-click zoom
    d3.select(svgRef.current).on('dblclick.zoom', null);
  }, []);
  
  // Listen for reheat events
  useEffect(() => {
    const handleReheat = () => {
      const simulation = simulationRef.current;
      if (!simulation) return;
      
      // Release all fixed positions
      simulation.nodes().forEach((node: any) => {
        node.fx = null;
        node.fy = null;
      });
      
      // Reheat the simulation
      simulation.alpha(0.5).restart();
    };
    
    graphEventBus.on('simulation:reheat', handleReheat);
    return () => {
      graphEventBus.off('simulation:reheat', handleReheat);
    };
  }, []);
  
  // Track drag subject
  const dragSubjectRef = useRef<any>(null);
  
  // Handle node drag
  const handleNodeDrag = useCallback((nodeId: string, dx: number, dy: number, type: 'start' | 'drag' | 'end') => {
    console.log('[GraphCanvasV2] handleNodeDrag called:', { nodeId, dx, dy, type });
    
    if (type === 'drag') {
      // Update position immediately for all layout types
      positionsRef.current.set(nodeId, { x: dx, y: dy });
      setPositionsVersion(v => v + 1);
    }
    
    // Only handle simulation-specific logic for force layouts
    if (currentLayout === 'force' || currentLayout === 'forceatlas2' || currentLayout === 'openord') {
      const simulation = simulationRef.current;
      
      if (currentLayout === 'force' && simulation) {
        if (type === 'start') {
          // Find the node in simulation
          const node = simulation.nodes().find((n: any) => n.id === nodeId);
          if (!node) {
            console.warn('[GraphCanvasV2] Node not found in simulation:', nodeId);
            return;
          }
          
          dragSubjectRef.current = node;
          
          if (!simulation.alpha()) {
            simulation.alphaTarget(0.3).restart();
          }
          node.fx = node.x;
          node.fy = node.y;
        } else if (type === 'drag') {
          if (dragSubjectRef.current) {
            dragSubjectRef.current.fx = dx;
            dragSubjectRef.current.fy = dy;
          }
        } else if (type === 'end') {
          if (dragSubjectRef.current) {
            if (!simulation.alpha()) {
              simulation.alphaTarget(0);
            }
            // Release the node so it can continue moving with the simulation
            dragSubjectRef.current.fx = null;
            dragSubjectRef.current.fy = null;
            dragSubjectRef.current = null;
          }
        }
      }
    }
  }, [currentLayout]);
  
  // Get current positions
  const positions = positionsRef.current;
  
  console.log('[GraphCanvasV2] Rendering with', nodes.length, 'nodes,', positions.size, 'positions');
  
  return (
    <div className="flex flex-col h-full">
      <LayoutSelector 
        currentLayout={currentLayout}
        onLayoutChange={setCurrentLayout}
      />
      <svg 
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 900 530"
      className="bg-background graph-canvas-svg"
      style={{ cursor: 'default', touchAction: 'none' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <g 
        ref={gRef}
        transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
      >
        {/* Render edges first (behind nodes) */}
        <g className="edges">
          {edges.map(edge => {
            const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
            const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
            const source = positions.get(sourceId);
            const target = positions.get(targetId);
            
            if (!source || !target) {
              console.warn(`Edge ${edge.id} missing position for source ${sourceId} or target ${targetId}`);
              return null;
            }
            
            return (
              <line
                key={edge.id}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={edge.appearance?.color || '#64748b'}
                strokeWidth={edge.appearance?.width || 2}
                opacity={0.6}
                className="dark:stroke-slate-500"
              />
            );
          })}
        </g>
        
        {/* Render nodes */}
        <g className="nodes">
          {nodes.map(node => {
            const pos = positions.get(node.id);
            if (!pos) {
              console.warn('[GraphCanvasV2] No position for node:', node.id);
              return null;
            }
            
            console.log('[GraphCanvasV2] Rendering node:', node.id, 'at position:', pos);
            
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
    </div>
  );
};