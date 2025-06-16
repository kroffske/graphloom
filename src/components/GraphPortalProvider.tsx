import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { graphEventBus } from '@/lib/graphEventBus';

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

export const useGraphPortal = () => {
  const context = useContext(GraphPortalContext);
  if (!context) {
    throw new Error('useGraphPortal must be used within GraphPortalProvider');
  }
  return context;
};

export const GraphPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portals, setPortals] = useState<Map<string, PortalInfo>>(new Map());
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
      updatePortalPosition(nodeId, { x, y });
    };

    const handleSimulationTick = ({ positions }: { positions: Map<string, Point> }) => {
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

    graphEventBus.on('node:position', handlePositionUpdate);
    graphEventBus.on('simulation:tick', handleSimulationTick);

    return () => {
      graphEventBus.off('node:position', handlePositionUpdate);
      graphEventBus.off('simulation:tick', handleSimulationTick);
    };
  }, [updatePortalPosition]);

  const contextValue: GraphPortalContextValue = {
    registerPortal,
    unregisterPortal,
    updatePortalPosition,
    overlayRef,
  };

  return (
    <GraphPortalContext.Provider value={contextValue}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {children}
        <GraphReactOverlay portals={portals} ref={overlayRef} />
      </div>
    </GraphPortalContext.Provider>
  );
};

// Separate component for the overlay to prevent re-renders of the main content
const GraphReactOverlay = React.forwardRef<
  HTMLDivElement,
  { portals: Map<string, PortalInfo> }
>(({ portals }, ref) => {
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
      {Array.from(portals.values()).map((portal) => (
        <div
          key={portal.id}
          className={`portal-item portal-${portal.type}`}
          style={{
            position: 'absolute',
            transform: `translate(${portal.position.x}px, ${portal.position.y}px)`,
            pointerEvents: portal.type === 'tooltip' ? 'none' : 'auto',
          }}
        >
          {portal.element}
        </div>
      ))}
    </div>
  );
});

GraphReactOverlay.displayName = 'GraphReactOverlay';