import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { graphEventBus } from '@/lib/graphEventBus';
import { debugLog } from '@/lib/debugLogger';
import { copyLog } from '@/lib/copyableLog';

interface Point {
  x: number;
  y: number;
}

interface PortalInfo {
  id: string;
  element: React.ReactElement;
  position: Point;
  type: 'node' | 'edge-label' | 'tooltip';
}

interface GraphPortalContextValue {
  registerPortal: (id: string, element: React.ReactElement, type: PortalInfo['type']) => void;
  unregisterPortal: (id: string) => void;
  updatePortalPosition: (id: string, position: Point) => void;
  overlayRef: React.RefObject<HTMLDivElement>;
}

const GraphPortalContext = createContext<GraphPortalContextValue | null>(null);

// Store current transform
let currentTransform = { k: 1, x: 0, y: 0 };

export const useGraphPortal = () => {
  const context = useContext(GraphPortalContext);
  if (!context) {
    throw new Error('useGraphPortal must be used within GraphPortalProvider');
  }
  return context;
};

export const GraphPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portals, setPortals] = useState<Map<string, PortalInfo>>(new Map());
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const [svgScale, setSvgScale] = useState({ x: 1, y: 1 });
  const overlayRef = useRef<HTMLDivElement>(null);

  const registerPortal = useCallback((id: string, element: React.ReactElement, type: PortalInfo['type']) => {
    setPortals(prev => {
      const next = new Map(prev);
      next.set(id, {
        id,
        element,
        position: prev.get(id)?.position || { x: 0, y: 0 },
        type,
      });
      return next;
    });
  }, []);

  const unregisterPortal = useCallback((id: string) => {
    setPortals(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const updatePortalPosition = useCallback((id: string, position: Point) => {
    setPortals(prev => {
      const portal = prev.get(id);
      if (!portal) return prev;
      
      const next = new Map(prev);
      next.set(id, { ...portal, position });
      return next;
    });
  }, []);

  // Listen to position updates from D3
  useEffect(() => {
    const handlePositionUpdate = ({ nodeId, x, y }: { nodeId: string; x: number; y: number }) => {
      debugLog('[Portal] Position update:', { nodeId, x, y });
      updatePortalPosition(nodeId, { x, y });
    };

    const handleSimulationTick = ({ positions }: { positions: Map<string, Point> }) => {
      debugLog('[Portal] Simulation tick, positions:', positions.size);
      if (positions.size > 0) {
        const firstEntry = positions.entries().next().value;
        debugLog('[Portal] Sample position:', firstEntry);
      }
      setPortals(prev => {
        const next = new Map(prev);
        positions.forEach((pos, id) => {
          const portal = next.get(id);
          if (portal) {
            next.set(id, { ...portal, position: pos });
          }
        });
        return next;
      });
    };

    const handleTransformChange = (newTransform: { k: number; x: number; y: number }) => {
      debugLog('[Portal] Transform change:', newTransform);
      currentTransform = newTransform;
      setTransform(newTransform);
    };

    const handleSvgDimensions = ({ svgScale }: { svgScale: { x: number; y: number } }) => {
      debugLog('[Portal] SVG scale update:', svgScale);
      setSvgScale(svgScale);
    };

    graphEventBus.on('node:position', handlePositionUpdate);
    graphEventBus.on('simulation:tick', handleSimulationTick);
    graphEventBus.on('transform:change', handleTransformChange);
    graphEventBus.on('svg:dimensions', handleSvgDimensions);

    return () => {
      graphEventBus.off('node:position', handlePositionUpdate);
      graphEventBus.off('simulation:tick', handleSimulationTick);
      graphEventBus.off('transform:change', handleTransformChange);
      graphEventBus.off('svg:dimensions', handleSvgDimensions);
    };
  }, [updatePortalPosition]);

  const contextValue: GraphPortalContextValue = {
    registerPortal,
    unregisterPortal,
    updatePortalPosition,
    overlayRef,
  };

  // Log overlay dimensions on mount
  useEffect(() => {
    if (overlayRef.current) {
      const rect = overlayRef.current.getBoundingClientRect();
      debugLog('[Portal] Overlay dimensions:', { width: rect.width, height: rect.height });
      
      // Log diagnostic info as copyable string
      setTimeout(() => {
        const diagnostics = {
          overlayDimensions: { width: rect.width, height: rect.height },
          currentTransform: transform,
          svgScale: svgScale,
          portalCount: portals.size,
          firstPortal: portals.size > 0 ? Array.from(portals.values())[0] : null
        };
        console.log('=== PORTAL DIAGNOSTICS (copy this) ===');
        console.log(JSON.stringify(diagnostics, null, 2));
        console.log('=== END DIAGNOSTICS ===');
      }, 1000);
    }
  }, [transform, portals]);

  return (
    <GraphPortalContext.Provider value={contextValue}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {children}
        <GraphReactOverlay portals={portals} transform={transform} svgScale={svgScale} ref={overlayRef} />
      </div>
    </GraphPortalContext.Provider>
  );
};

// Separate component for the overlay to prevent re-renders of the main content
const GraphReactOverlay = React.forwardRef<
  HTMLDivElement,
  { portals: Map<string, PortalInfo>; transform: { k: number; x: number; y: number }; svgScale: { x: number; y: number } }
>(({ portals, transform, svgScale }, ref) => {
  return (
    <div
      ref={ref}
      className="graph-react-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          transformOrigin: '0 0',
        }}
      >
        {Array.from(portals.values()).map((portal) => {
          // Apply SVG scale to convert from viewBox coordinates to pixel coordinates
          const scaledX = portal.position.x * svgScale.x;
          const scaledY = portal.position.y * svgScale.y;
          
          if (portal.type === 'node' && portal.id.includes('0')) { // Log first node
            debugLog('[Portal] Rendering node:', portal.id, 'at position:', portal.position, 'scaled to:', { x: scaledX, y: scaledY });
          }
          return (
            <div
              key={portal.id}
              className={`portal-item portal-${portal.type}`}
              style={{
                position: 'absolute',
                transform: `translate(${scaledX - 36}px, ${scaledY - 36}px)`,
                pointerEvents: portal.type === 'tooltip' ? 'none' : 'auto',
                width: '72px',
                height: '72px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {portal.element}
            </div>
          );
        })}
      </div>
    </div>
  );
});

GraphReactOverlay.displayName = 'GraphReactOverlay';