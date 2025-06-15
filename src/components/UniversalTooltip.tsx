import React from 'react';
import { GraphNode, GraphEdge } from '@/types/graph';
import { useGraphStore } from '@/state/useGraphStore';

type UniversalTooltipProps = {
  item: GraphNode | GraphEdge | null;
  type: 'node' | 'edge' | null;
  position: { x: number; y: number } | null;
};

const UniversalTooltip: React.FC<UniversalTooltipProps> = ({ item, type, position }) => {
  const { nodes } = useGraphStore();
  const [visible, setVisible] = React.useState(false);

  // Moved useMemo before any conditional returns to respect the rules of hooks.
  const nodeMap = React.useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  React.useEffect(() => {
    if (!item || !position) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, [item, position]);

  if (!item || !type || !position || !visible) return null;

  const renderContent = () => {
    if (type === 'node') {
      const node = item as GraphNode;
      return (
        <>
          <div className="font-bold text-base text-foreground mb-1 truncate">{node.label}</div>
          <div className="text-xs text-muted-foreground mb-2">Node ({node.type})</div>
          <dl className="grid grid-cols-2 gap-x-2 gap-y-1">
            {Object.entries(node.attributes).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="font-semibold text-xs text-muted-foreground">{k}</dt>
                <dd className="text-xs text-foreground truncate">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </>
      );
    }

    if (type === 'edge') {
      const edge = item as GraphEdge;
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      return (
        <>
          <div className="font-bold text-base text-foreground mb-1 truncate">
            {sourceNode?.label ?? edge.source} → {targetNode?.label ?? edge.target}
          </div>
          <div className="text-xs text-muted-foreground mb-2">Edge ({edge.type || 'default'})</div>
          {edge.attributes && Object.keys(edge.attributes).length > 0 && (
             <dl className="grid grid-cols-2 gap-x-2 gap-y-1">
              {Object.entries(edge.attributes).map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="font-semibold text-xs text-muted-foreground">{k}</dt>
                  <dd className="text-xs text-foreground truncate">{String(v)}</dd>
                </div>
              ))}
            </dl>
          )}
        </>
      );
    }
    return null;
  };

  return (
    <div
      className="fixed z-50 animate-fade-in bg-card border shadow-xl rounded-lg p-3 min-w-[200px] max-w-xs transition-opacity"
      style={{
        left: position.x + 15,
        top: position.y + 15,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms',
      }}
      role="tooltip"
      tabIndex={-1}
    >
      {renderContent()}
    </div>
  );
};

export default UniversalTooltip;
