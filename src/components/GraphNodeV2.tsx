import React, { useCallback, useRef, useEffect, useState } from 'react';
import { GraphNode } from '@/types/graph.types';
import { useGraphStore } from '@/state/useGraphStore';

interface GraphNodeV2Props {
  node: GraphNode;
  x: number;
  y: number;
  transform: { k: number; x: number; y: number };
  onDrag?: (nodeId: string, x: number, y: number, type: 'start' | 'drag' | 'end') => void;
}

// Memoize to prevent unnecessary re-renders
export const GraphNodeV2 = React.memo<GraphNodeV2Props>(({ 
  node, 
  x, 
  y, 
  transform,
  onDrag
}) => {
  const selectedNodeId = useGraphStore(state => state.selectedNodeId);
  const hoveredNodeId = useGraphStore(state => state.hoveredNodeId);
  const selectNode = useGraphStore(state => state.selectNode);
  const setHoveredNodeId = useGraphStore(state => state.setHoveredNodeId);
  
  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  
  // Hide labels when zoomed out
  const showLabel = transform.k > 0.6;
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
  }, [node.id, selectNode]);
  
  const handleMouseEnter = useCallback(() => {
    if (!isDragging) {
      setHoveredNodeId(node.id);
    }
  }, [node.id, setHoveredNodeId, isDragging]);
  
  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      setHoveredNodeId(null);
    }
  }, [setHoveredNodeId, isDragging]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!onDrag) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    const svg = (e.target as SVGElement).ownerSVGElement;
    if (!svg) return;
    
    setIsDragging(true);
    
    // Convert mouse position to SVG coordinates
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    
    // Account for transform
    dragStart.current = {
      x: (svgP.x - transform.x) / transform.k,
      y: (svgP.y - transform.y) / transform.k,
      nodeX: x,
      nodeY: y
    };
    
    onDrag(node.id, x, y, 'start');
  }, [node.id, x, y, transform, onDrag]);
  
  // Handle drag with mouse move on document
  useEffect(() => {
    if (!isDragging || !onDrag) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const svg = document.querySelector('svg');
      if (!svg) return;
      
      // Convert mouse position to SVG coordinates
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
      
      // Calculate new position accounting for transform
      const newX = (svgP.x - transform.x) / transform.k;
      const newY = (svgP.y - transform.y) / transform.k;
      
      onDrag(node.id, newX, newY, 'drag');
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      onDrag(node.id, 0, 0, 'end');
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, node.id, transform, onDrag]);
  
  return (
    <g 
      transform={`translate(${x},${y})`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Background circle */}
      <circle
        r={36}
        fill={node.appearance?.backgroundColor || '#ffffff'}
        stroke={isSelected ? '#3b82f6' : '#e5e7eb'}
        strokeWidth={isSelected ? 3 : 1.5}
        style={{ 
          filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' : undefined,
          transition: 'stroke 0.2s, stroke-width 0.2s'
        }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
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
      
      {/* Selection indicator */}
      {isSelected && (
        <circle
          r={40}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="4 2"
          opacity={0.5}
          pointerEvents="none"
          style={{
            animation: 'rotate 10s linear infinite',
            transformOrigin: 'center'
          }}
        />
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

GraphNodeV2.displayName = 'GraphNodeV2';