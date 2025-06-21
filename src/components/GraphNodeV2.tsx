import React, { useCallback, useRef, useEffect, useState } from 'react';
import { GraphNode } from '@/types/graph.types';
import { useGraphStore } from '@/state/useGraphStore';
import { useIconRegistry } from '@/components/IconRegistry';
import { isEmoji } from '@/config/emojiIcons';
import { resolveLabelTemplate } from '@/utils/labelTemplate';

interface GraphNodeV2Props {
  node: GraphNode;
  x: number;
  y: number;
  transform: { k: number; x: number; y: number };
  onDrag?: (nodeId: string, x: number, y: number, type: 'start' | 'drag' | 'end') => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  showLabel?: boolean;
  showIcon?: boolean;
}

// Memoize to prevent unnecessary re-renders
export const GraphNodeV2 = React.memo<GraphNodeV2Props>(({ 
  node, 
  x, 
  y, 
  transform,
  onDrag,
  onMouseEnter,
  onMouseLeave,
  showLabel = true,
  showIcon = true
}) => {
  const selectedNodeId = useGraphStore(state => state.selectedNodeId);
  const hoveredNodeId = useGraphStore(state => state.hoveredNodeId);
  const selectNode = useGraphStore(state => state.selectNode);
  const setHoveredNodeId = useGraphStore(state => state.setHoveredNodeId);
  const nodeTypeAppearances = useGraphStore(state => state.nodeTypeAppearances);
  const iconRegistry = useIconRegistry();
  
  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  
  // Get appearance with fallback to node type appearance
  const typeAppearance = nodeTypeAppearances?.[node.type] ?? {};
  const appearance = node.appearance && Object.keys(node.appearance).length > 0
    ? node.appearance
    : typeAppearance;
  
  // Extract appearance properties with defaults
  // Important: Don't default backgroundColor to white - respect transparent/empty values
  const backgroundColor = (appearance.backgroundColor !== undefined && appearance.backgroundColor !== '')
    ? appearance.backgroundColor 
    : 'transparent';
  const iconColor = appearance.iconColor || appearance.color || '#374151';
  const icon = appearance.icon || node.type;
  
  // Border settings
  const borderEnabled = appearance.borderEnabled ?? false;
  const borderColor = appearance.borderColor || '#e5e7eb';
  const borderWidth = appearance.borderWidth ?? 1.5;
  
  // Size settings
  const nodeSize = appearance.size ?? 38; // Default 38px diameter
  const radius = nodeSize / 2;
  const iconSize = appearance.iconSize ?? 70; // Default 70% of node size
  const iconScale = iconSize / 100; // Convert percentage to scale factor
  
  // Use prop override for label visibility
  const shouldShowLabel = showLabel && transform.k > 0.6;
  
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
      onMouseEnter?.();
    }
  }, [node.id, setHoveredNodeId, isDragging, onMouseEnter]);
  
  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      setHoveredNodeId(null);
      onMouseLeave?.();
    }
  }, [setHoveredNodeId, isDragging, onMouseLeave]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // console.log('[GraphNodeV2] handleMouseDown called, button:', e.button, 'onDrag available:', !!onDrag);
    // Only handle left mouse button (0) for dragging
    if (!onDrag || e.button !== 0) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    // console.log('[GraphNodeV2] Mouse down on node:', node.id, 'at position:', x, y);
    
    // Start drag
    onDrag(node.id, x, y, 'start');
    
    // Set up drag handlers immediately
    const handleMouseMove = (e: MouseEvent) => {
      const svg = document.querySelector('svg.graph-canvas-svg');
      if (!svg) {
        console.error('[GraphNodeV2] No graph SVG element found');
        return;
      }
      
      // Get mouse position relative to SVG viewport
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      
      // Get the transform matrix from the g element
      const gElement = svg.querySelector('g');
      if (!gElement) {
        console.error('[GraphNodeV2] No g element found in graph SVG');
        return;
      }
      
      // Convert to SVG coordinates
      const screenCTM = gElement.getScreenCTM();
      if (!screenCTM) {
        console.error('[GraphNodeV2] No screen CTM available');
        return;
      }
      
      const svgCoords = pt.matrixTransform(screenCTM.inverse());
      
      // console.log('[GraphNodeV2] Drag move:', { 
      //   nodeId: node.id, 
      //   clientX: e.clientX, 
      //   clientY: e.clientY, 
      //   worldX: svgCoords.x, 
      //   worldY: svgCoords.y
      // });
      
      onDrag(node.id, svgCoords.x, svgCoords.y, 'drag');
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      // console.log('[GraphNodeV2] Mouse up, ending drag for node:', node.id);
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
        r={radius}
        fill={backgroundColor}
        stroke={isSelected ? '#3b82f6' : (borderEnabled ? borderColor : 'transparent')}
        strokeWidth={isSelected ? 3 : (borderEnabled ? borderWidth : 0)}
        className={borderEnabled && !isSelected ? "dark:stroke-slate-600" : ""}
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
      />
      
      {/* Icon/Emoji */}
      {icon && showIcon && (
        <>
          {isEmoji(icon) ? (
            // Render emoji directly as text
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={radius * iconScale}
              fill={iconColor}
              pointerEvents="none"
              style={{ userSelect: 'none' }}
            >
              {icon}
            </text>
          ) : (
            // Render icon component if available
            (() => {
              const IconComponent = iconRegistry[icon];
              if (IconComponent) {
                return (
                  <foreignObject
                    x={-radius * iconScale * 0.5}
                    y={-radius * iconScale * 0.5}
                    width={radius * iconScale}
                    height={radius * iconScale}
                    pointerEvents="none"
                    style={{ overflow: 'visible' }}
                  >
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <IconComponent 
                        width={radius * iconScale * 0.8}
                        height={radius * iconScale * 0.8}
                        filled={false}
                        aria-label={icon}
                        color={iconColor}
                      />
                    </div>
                  </foreignObject>
                );
              }
              // Fallback to text if no icon found
              return (
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={radius * iconScale * 0.7}
                  fill={iconColor}
                  pointerEvents="none"
                  style={{ userSelect: 'none' }}
                >
                  {icon}
                </text>
              );
            })()
          )}
        </>
      )}
      
      {/* Label (hidden when zoomed out) */}
      {shouldShowLabel && (() => {
        let label = node.label;
        
        // Check if we should use a template
        if (appearance.labelTemplate) {
          const context = {
            ...node,
            ...node.attributes,
            node_type: node.type,
            id: node.id,
            label: node.label
          };
          label = resolveLabelTemplate(appearance.labelTemplate, context, node.label);
        }
        
        return (
          <text
            y={radius + 16}
            textAnchor="middle"
            fontSize={12}
            fill="#6b7280"
            className="dark:fill-slate-400"
            pointerEvents="none"
            style={{ userSelect: 'none' }}
          >
            {label.split('\n').map((line, i) => (
              <tspan key={i} x={0} dy={i === 0 ? 0 : 14}>
                {line}
              </tspan>
            ))}
          </text>
        );
      })()}
      
      {/* Selection indicator (shown when right-clicked) */}
      {isSelected && (
        <circle
          r={radius + 3}
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
    prev.transform.k === next.transform.k &&
    prev.showLabel === next.showLabel &&
    prev.showIcon === next.showIcon &&
    prev.onDrag === next.onDrag
  );
});

GraphNodeV2.displayName = 'GraphNodeV2';