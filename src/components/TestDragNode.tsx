import React, { useState, useCallback } from 'react';

export const TestDragNode: React.FC = () => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('[TestDragNode] Mouse down');
    setIsDragging(true);
    
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;
    
    const handleMouseMove = (e: MouseEvent) => {
      console.log('[TestDragNode] Mouse move');
      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY
      });
    };
    
    const handleMouseUp = () => {
      console.log('[TestDragNode] Mouse up');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position]);
  
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#f0f0f0' }}>
      <svg width="100%" height="100%">
        <g transform={`translate(${position.x},${position.y})`}>
          <circle
            r={30}
            fill="#3b82f6"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            Drag me
          </text>
        </g>
      </svg>
      <div style={{ position: 'absolute', top: 10, left: 10 }}>
        Position: {position.x.toFixed(0)}, {position.y.toFixed(0)}
      </div>
    </div>
  );
};