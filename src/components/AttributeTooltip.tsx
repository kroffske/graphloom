
import React from "react";
import { GraphNode } from "@/state/useGraphStore";

const AttributeTooltip = ({ node }: { node?: GraphNode }) => {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (!node) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, [node]);
  if (!node || !visible) return null;
  return (
    <div
      className="fixed left-1/2 top-28 z-50 animate-fade-in bg-card border shadow-xl rounded-lg p-3 min-w-[180px] max-w-xs transition-opacity"
      style={{
        pointerEvents: "none",
        translate: "-50% 0",
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms",
      }}
      role="tooltip"
      tabIndex={-1}
    >
      <div className="font-bold text-base text-foreground mb-2 truncate">{node.label}</div>
      <dl className="grid grid-cols-2 gap-x-2 gap-y-1">
        {Object.entries(node.attributes).map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-semibold text-xs text-muted-foreground">{k}</dt>
            <dd className="text-xs text-foreground truncate">{String(v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default AttributeTooltip;
