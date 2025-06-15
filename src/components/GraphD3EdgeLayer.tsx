import React from "react";
import { useGraphStore } from "@/state/useGraphStore";
import { DEFAULT_EDGE_COLOR, DEFAULT_EDGE_WIDTH } from "@/config/graphConstants";
import { resolveLabelTemplate } from "@/utils/labelTemplate";

type GraphD3EdgeLayerProps = {
  edges: any[];
  nodes: any[];
  useDynamic: boolean;
  simulation?: any;
  linkRef: React.MutableRefObject<any>;
  // NEW: edge context menu handler
  onEdgeContextMenu?: (edgeId: string, event: React.MouseEvent) => void;
};

const GraphD3EdgeLayer: React.FC<GraphD3EdgeLayerProps> = ({
  edges,
  nodes,
  useDynamic,
  simulation,
  linkRef,
  onEdgeContextMenu,
}) => {
  const { selectedEdgeId, selectEdge, edgeAppearances, showEdgeLabels, setHoveredEdgeId, edgeTypeAppearances } = useGraphStore();

  // Dynamic rendering is handled by D3 in force mode; call edge setup externally.
  if (useDynamic) return <g ref={linkRef} />;

  return (
    <g>
      {edges.map((e) => {
        const s = typeof e.source === "object" ? e.source : nodes.find((n) => n.id === e.source);
        const t = typeof e.target === "object" ? e.target : nodes.find((n) => n.id === e.target);
        if (!s || !t) return null;

        // Get appearance (type-based, then per-edge override)
        const edgeType = e.type || 'default';
        const typeApp = edgeTypeAppearances[edgeType] || {};
        const edgeApp = { ...typeApp, ...e.appearance, ...edgeAppearances[e.id] };
        const color = edgeApp.color || DEFAULT_EDGE_COLOR;
        const width = edgeApp.width || DEFAULT_EDGE_WIDTH;
        const isSelected = selectedEdgeId === e.id;

        // Center for label (midpoint)
        const midX = (s.x + t.x) / 2;
        const midY = (s.y + t.y) / 2;

        const fallbackId = "";
        let edgeLabel = edgeApp.label; // Prio 1: custom override from inspector

        if (edgeLabel === undefined) {
          if (edgeApp.labelTemplate) {
            const context = {
              ...e,
              ...e.attributes,
              source_label: s.label,
              target_label: t.label,
              source: s, // pass full source node
              target: t, // pass full target node
            };
            edgeLabel = resolveLabelTemplate(edgeApp.labelTemplate, context, fallbackId);
          }
        }

        return (
          <g key={e.id}>
            <line
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke={color}
              strokeWidth={isSelected ? width + 2 : width}
              opacity={isSelected ? 1 : 0.7}
              style={{
                cursor: "pointer",
                strokeDasharray: isSelected ? "0" : undefined,
                transition: "stroke 0.15s, stroke-width 0.15s, opacity 0.2s",
                filter: isSelected ? "drop-shadow(0 0 4px #60a5fa)" : undefined,
              }}
              onMouseEnter={() => setHoveredEdgeId(e.id)}
              onMouseLeave={() => setHoveredEdgeId(null)}
              onClick={(ev) => {
                ev.stopPropagation();
                selectEdge(isSelected ? null : e.id);
              }}
              onContextMenu={
                onEdgeContextMenu
                  ? (ev) => {
                      ev.preventDefault();
                      ev.stopPropagation();
                      // Select edge before opening menu (right-click)
                      selectEdge(e.id);
                      onEdgeContextMenu(e.id, ev);
                    }
                  : undefined
              }
              onMouseDown={ev => ev.stopPropagation()}
              onMouseUp={ev => ev.stopPropagation()}
              tabIndex={0}
              onKeyDown={ev => {
                if (ev.key === "Enter" || ev.key === " ") {
                  selectEdge(isSelected ? null : e.id);
                }
              }}
            />
            {/* Show label if enabled and available */}
            {showEdgeLabels && edgeLabel && (
              <text
                x={midX}
                y={midY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                pointerEvents="none"
                fill="#475569"
                style={{
                  userSelect: "none",
                  textShadow: "0 0 3px #fff, 0 0 8px #fff",
                  fontWeight: 500,
                  paintOrder: "stroke fill",
                  stroke: "#fff",
                  strokeWidth: 4,
                  strokeLinejoin: "round",
                }}
              >
                <tspan fill="#334155" stroke="white" strokeWidth="1.5" style={{ paintOrder: "stroke fill" }}>
                  {edgeLabel}
                </tspan>
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

export default GraphD3EdgeLayer;
