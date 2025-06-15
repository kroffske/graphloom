
import React from "react";

const EDGE_COLOR = "#64748b";

type GraphD3EdgeLayerProps = {
  edges: any[];
  nodes: any[];
  useDynamic: boolean;
  simulation?: any;
  linkRef: React.MutableRefObject<any>;
};

// Renders SVG edges. If useDynamic is true, edges are updated by force sim.
const GraphD3EdgeLayer: React.FC<GraphD3EdgeLayerProps> = ({
  edges,
  nodes,
  useDynamic,
  simulation,
  linkRef,
}) => {
  // Dynamic rendering is handled by D3 in force mode; call edge setup externally.
  // Here, in static layouts, edges are positioned once.
  if (useDynamic) return <g ref={linkRef} />;
  return (
    <g>
      {edges.map((e) => {
        const s = typeof e.source === "object" ? e.source : nodes.find((n) => n.id === e.source);
        const t = typeof e.target === "object" ? e.target : nodes.find((n) => n.id === e.target);
        if (!s || !t) return null;
        return (
          <line
            key={e.id}
            x1={s.x}
            y1={s.y}
            x2={t.x}
            y2={t.y}
            stroke={EDGE_COLOR}
            strokeWidth={2}
            opacity={0.7}
          />
        );
      })}
    </g>
  );
};

export default GraphD3EdgeLayer;
