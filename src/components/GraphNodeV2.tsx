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
  
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Double-click releases the node from fixed position
    if (onDrag) {
      onDrag(node.id, 0, 0, 'end');
    }
  }, [node.id, onDrag]);
  
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
    
    setIsDragging(true);
    onDrag(node.id, x, y, 'start');
  }, [node.id, x, y, onDrag]);
  
  // Handle drag with mouse move on document
  useEffect(() => {
    if (!isDragging || !onDrag) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const svg = document.querySelector('svg');
      if (!svg) return;
      
      // Get the SVG point in screen coordinates
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      
      // Transform to SVG coordinates
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      
      const svgP = pt.matrixTransform(ctm.inverse());
      
      // Apply the inverse of the group transform to get world coordinates
      const worldX = (svgP.x - transform.x) / transform.k;
      const worldY = (svgP.y - transform.y) / transform.k;
      
      onDrag(node.id, worldX, worldY, 'drag');
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
        className="dark:stroke-slate-600"
        style={{ 
          filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' : undefined,
          transition: 'stroke 0.2s, stroke-width 0.2s'
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
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
          className="dark:fill-slate-400"
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