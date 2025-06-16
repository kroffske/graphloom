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
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Left click now does nothing - dragging is handled by mousedown
    e.stopPropagation();
  }, []);
  
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Right-click selects the node (for context menu/info)
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
    console.log('[GraphNodeV2] handleMouseDown called, button:', e.button, 'onDrag available:', !!onDrag);
    // Only handle left mouse button (0) for dragging
    if (!onDrag || e.button !== 0) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    console.log('[GraphNodeV2] Mouse down on node:', node.id, 'at position:', x, y);
    
    // Start drag
    onDrag(node.id, x, y, 'start');
    
    // Set up drag handlers immediately
    const handleMouseMove = (e: MouseEvent) => {
      const svg = document.querySelector('svg');
      if (!svg) {
        console.error('[GraphNodeV2] No SVG element found');
        return;
      }
      
      // Get mouse position relative to SVG viewport
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      
      // Get the transform matrix from the g element
      const gElement = svg.querySelector('g');
      if (!gElement) {
        console.error('[GraphNodeV2] No g element found');
        return;
      }
      
      // Convert to SVG coordinates
      const screenCTM = gElement.getScreenCTM();
      if (!screenCTM) {
        console.error('[GraphNodeV2] No screen CTM available');
        return;
      }
      
      const svgCoords = pt.matrixTransform(screenCTM.inverse());
      
      console.log('[GraphNodeV2] Drag move:', { 
        nodeId: node.id, 
        clientX: e.clientX, 
        clientY: e.clientY, 
        worldX: svgCoords.x, 
        worldY: svgCoords.y,
        transform: transform
      });
      
      onDrag(node.id, svgCoords.x, svgCoords.y, 'drag');
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      console.log('[GraphNodeV2] Mouse up, ending drag for node:', node.id);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsDragging(false);
      onDrag(node.id, 0, 0, 'end');
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    setIsDragging(true);
  }, [node.id, x, y, onDrag]);
  
  // No longer needed - drag is handled entirely in handleMouseDown
  
  return (
    <g 
      className="graph-node-svg"
      transform={`translate(${x},${y})`}
      style={{ cursor: isDragging ? 'grabbing' : 'pointer', pointerEvents: 'all' }}
      data-node-id={node.id}
      onMouseDown={handleMouseDown}
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
          transition: 'stroke 0.2s, stroke-width 0.2s',
          cursor: 'grab',
          pointerEvents: 'all'
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerDown={(e) => console.log('[GraphNodeV2] Pointer down on circle:', node.id, e)}
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
      
      {/* Selection indicator (shown when right-clicked) */}
      {isSelected && (
        <circle
          r={42}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={3}
          strokeDasharray="6 3"
          opacity={0.8}
          pointerEvents="none"
          style={{
            animation: 'rotate 20s linear infinite',
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