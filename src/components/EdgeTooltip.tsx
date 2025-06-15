
import React from "react";
import { GraphEdge } from "@/state/useGraphStore";

type EdgeTooltipProps = {
  edge?: GraphEdge;
  position: { x: number; y: number } | null;
};

const EdgeTooltip: React.FC<EdgeTooltipProps> = ({ edge, position }) => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!edge || !position) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(timer);
  }, [edge, position]);

  if (!edge || !position || !visible) return null;

  // Label logic: prefer edge.appearance.label, else look for labelField, else fallback to edge.id
  let label: string | undefined;
  if (edge.appearance?.label) {
    label = String(edge.appearance.label);
  } else if (
    edge.appearance?.labelField &&
    edge.attributes &&
    edge.attributes[edge.appearance.labelField] !== undefined
  ) {
    label = String(edge.attributes[edge.appearance.labelField]);
  }

  return (
    <div
      className="fixed z-50 animate-fade-in bg-card border shadow-xl rounded-lg p-3 min-w-[180px] max-w-xs transition-opacity pointer-events-none"
      style={{
        left: position.x + 15,
        top: position.y + 10,
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms",
      }}
      role="tooltip"
      tabIndex={-1}
    >
      <div className="font-bold text-base text-foreground mb-2 truncate">
        {label || `Edge: ${edge.id}`}
      </div>
      <dl className="grid grid-cols-2 gap-x-2 gap-y-1">
        <div className="contents">
          <dt className="font-semibold text-xs text-muted-foreground">Source</dt>
          <dd className="text-xs text-foreground truncate">{edge.source}</dd>
        </div>
        <div className="contents">
          <dt className="font-semibold text-xs text-muted-foreground">Target</dt>
          <dd className="text-xs text-foreground truncate">{edge.target}</dd>
        </div>
        {edge.type && (
          <div className="contents">
            <dt className="font-semibold text-xs text-muted-foreground">Type</dt>
            <dd className="text-xs text-foreground truncate">{edge.type}</dd>
          </div>
        )}
        {edge.appearance?.color && (
          <div className="contents">
            <dt className="font-semibold text-xs text-muted-foreground">Color</dt>
            <dd className="text-xs text-foreground truncate">{edge.appearance.color}</dd>
          </div>
        )}
        {edge.appearance?.width && (
          <div className="contents">
            <dt className="font-semibold text-xs text-muted-foreground">Width</dt>
            <dd className="text-xs text-foreground truncate">{edge.appearance.width}</dd>
          </div>
        )}
        {edge.attributes &&
          Object.entries(edge.attributes).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-semibold text-xs text-muted-foreground">{k}</dt>
              <dd className="text-xs text-foreground truncate">{String(v)}</dd>
            </div>
          ))}
      </dl>
    </div>
  );
};

export default EdgeTooltip;
