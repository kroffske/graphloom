import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useGraphStore } from '@/state/useGraphStore';
import { GraphNodeV2 } from './GraphNodeV2';
import { graphEventBus } from '@/lib/graphEventBus';
import { LayoutSelector, LayoutType } from './LayoutSelector';
import { PerformanceIndicator } from './PerformanceIndicator';
import { 
  ForceAtlas2Layout,
  OpenOrdLayout,
  applyCircleLayout,
  applyHierarchyLayout,
  applyRadialLayout,
  applyFastLayout
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
      
      // Update React state less frequently for large graphs
      tickCount++;
      const updateFrequency = nodes.length > 1000 ? 6 : 2; // 10fps for large graphs, 30fps for small
      if (tickCount % updateFrequency === 0) {
        setPositionsVersion(v => v + 1);
      }
    };
    
    switch (currentLayout) {
      case 'force': {
        // D3 Force Layout optimized for subgraphs
        const isLargeGraph = nodes.length > 1000;
        
        const simulation = d3.forceSimulation(simNodes)
          .force('link', d3.forceLink(simEdges)
            .id((d: any) => d.id)
            .distance((d: any) => {
              // Shorter distances for internal edges, longer for inter-subgraph
              return d.type === 'INTER_SUBGRAPH' ? 150 : 60;
            })
            .strength((d: any) => {
              // Stronger internal connections, weaker inter-subgraph
              return d.type === 'INTER_SUBGRAPH' ? 0.2 : 0.8;
            })
          )
          .force('charge', d3.forceManyBody()
            .strength(isLargeGraph ? -300 : -400)
            .theta(isLargeGraph ? 0.9 : 0.8) // More approximate for large graphs
            .distanceMax(isLargeGraph ? 200 : 500) // Limit interaction distance
          )
          .force('center', d3.forceCenter(450, 265).strength(0.05))
          .force('collision', d3.forceCollide()
            .radius(isLargeGraph ? 16 : 22)
            .strength(0.7)
            .iterations(isLargeGraph ? 1 : 2) // Fewer iterations for performance
          );
        
        // Faster cooling for large graphs
        if (isLargeGraph) {
          simulation
            .velocityDecay(0.6) // More friction
            .alphaDecay(0.05) // Faster cooling
            .alphaMin(0.01); // Stop sooner
        } else {
          simulation
            .velocityDecay(0.4)
            .alphaDecay(0.02);
        }
        
        simulationRef.current = simulation;
        
        simulation.on('tick', () => {
          updatePositions();
        });
        
        // Lower initial alpha for large graphs
        simulation.alpha(isLargeGraph ? 0.2 : 0.3).restart();
        break;
      }
      
      case 'forceatlas2': {
        // ForceAtlas2 Layout optimized for subgraphs
        const isLargeGraph = nodes.length > 1000;
        
        const fa2 = new ForceAtlas2Layout(simNodes, simEdges, {
          gravity: isLargeGraph ? 2.0 : 1.0, // Stronger gravity for large graphs
          scalingRatio: isLargeGraph ? 10.0 : 2.0, // More spacing
          barnesHut: true,
          barnesHutTheta: isLargeGraph ? 0.8 : 0.5, // More approximation
          linLogMode: true, // Better for graphs with varying densities
          preventOverlap: true,
          edgeWeightInfluence: 0.5, // Consider edge weights
          nodeSize: isLargeGraph ? 20 : 10
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
        
        // Stop after fewer iterations for large graphs
        setTimeout(() => fa2.stop(), isLargeGraph ? 3000 : 5000);
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
      
      case 'fast': {
        // Fast Layout - immediate positioning
        applyFastLayout(simNodes, {
          width: 900,
          height: 530,
          padding: 50
        });
        updatePositions();
        
        // Optional: Run a quick force simulation to separate overlapping nodes
        if (nodes.length < 1000) {
          const quickSim = d3.forceSimulation(simNodes)
            .force('collision', d3.forceCollide().radius(20))
            .velocityDecay(0.8)
            .alphaDecay(0.1)
            .alpha(0.1);
          
          for (let i = 0; i < 50; i++) {
            quickSim.tick();
          }
          
          updatePositions();
        }
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
  
  // Viewport culling - only render visible nodes
  const visibleNodes = React.useMemo(() => {
    if (!svgRef.current) return nodes;
    
    const rect = svgRef.current.getBoundingClientRect();
    const viewBox = { width: 900, height: 530 };
    
    // Calculate visible bounds in world coordinates
    const padding = 100; // Extra padding to avoid pop-in
    const visibleBounds = {
      left: -transform.x / transform.k - padding,
      right: (-transform.x + viewBox.width) / transform.k + padding,
      top: -transform.y / transform.k - padding,
      bottom: (-transform.y + viewBox.height) / transform.k + padding
    };
    
    // Filter nodes that are within visible bounds
    return nodes.filter(node => {
      const pos = positions.get(node.id);
      if (!pos) return false;
      
      return pos.x >= visibleBounds.left && 
             pos.x <= visibleBounds.right && 
             pos.y >= visibleBounds.top && 
             pos.y <= visibleBounds.bottom;
    });
  }, [nodes, positions, transform, positionsVersion]);
  
  // Level of detail based on zoom
  const showLabels = transform.k > 0.6;
  const showIcons = transform.k > 0.3;
  const simplifiedRendering = transform.k < 0.5;
  
  console.log('[GraphCanvasV2] Rendering', visibleNodes.length, 'of', nodes.length, 'nodes (zoom:', transform.k.toFixed(2), ')');
  
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
            
            if (!source || !target) return null;
            
            // Skip edges that are completely outside viewport
            const edgeBounds = {
              left: Math.min(source.x, target.x),
              right: Math.max(source.x, target.x),
              top: Math.min(source.y, target.y),
              bottom: Math.max(source.y, target.y)
            };
            
            const visibleBounds = {
              left: -transform.x / transform.k - 100,
              right: (-transform.x + 900) / transform.k + 100,
              top: -transform.y / transform.k - 100,
              bottom: (-transform.y + 530) / transform.k + 100
            };
            
            if (edgeBounds.right < visibleBounds.left || 
                edgeBounds.left > visibleBounds.right ||
                edgeBounds.bottom < visibleBounds.top || 
                edgeBounds.top > visibleBounds.bottom) {
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
                strokeWidth={simplifiedRendering ? 1 : (edge.appearance?.width || 2)}
                opacity={simplifiedRendering ? 0.3 : 0.6}
                className="dark:stroke-slate-500"
              />
            );
          })}
        </g>
        
        {/* Render nodes */}
        <g className="nodes">
          {visibleNodes.map(node => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            
            // Simplified rendering for performance when zoomed out
            if (simplifiedRendering) {
              return (
                <circle
                  key={node.id}
                  cx={pos.x}
                  cy={pos.y}
                  r={5}
                  fill={node.appearance?.backgroundColor || 'transparent'}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  className="cursor-pointer"
                  onClick={() => useGraphStore.getState().selectNode(node.id)}
                />
              );
            }
            
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
    <PerformanceIndicator
      totalNodes={nodes.length}
      visibleNodes={visibleNodes.length}
      zoom={transform.k}
      simplified={simplifiedRendering}
    />
    </div>
  );
};