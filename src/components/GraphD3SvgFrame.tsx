
import React, { useRef } from "react";
import { WIDTH, HEIGHT } from "@/hooks/useD3SvgGraph";
import GraphD3EdgeLayer from "./GraphD3EdgeLayer";
import GraphD3NodeLayer from "./GraphD3NodeLayer";
import { useGraphStore } from "@/state/useGraphStore";

type GraphD3SvgFrameProps = {
  simEdges: any[];
  simNodes: any[];
  layoutMode: "force" | "circle" | "hierarchy" | "manual";
  simulation: any;
  linkRef: React.MutableRefObject<SVGGElement | null>;
  nodeGroupRef: React.MutableRefObject<SVGGElement | null>;
  hiddenNodeIds: Set<string>;
  setHiddenNodeIds: (s: Set<string>) => void;
  setContextNodeId: (id: string | null) => void;
  setHoveredNodeId: (id: string | null) => void;
};

const GraphD3SvgFrame: React.FC<GraphD3SvgFrameProps> = ({
  simEdges,
  simNodes,
  layoutMode,
  simulation,
  linkRef,
  nodeGroupRef,
  hiddenNodeIds,
  setHiddenNodeIds,
  setContextNodeId,
  setHoveredNodeId,
}) => {
  const { selectEdge } = useGraphStore();

  function handleBackgroundPointerDown(ev: React.MouseEvent) {
    if (!ev.shiftKey && !ev.ctrlKey && !ev.metaKey) {
      selectEdge(null);
    }
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        background: "none",
        padding: 0,
        margin: 0,
      }}
      aria-label="Graph Visualization"
      tabIndex={0}
      onPointerDown={handleBackgroundPointerDown}
    >
      <GraphD3EdgeLayer
        edges={simEdges}
        nodes={simNodes}
        useDynamic={layoutMode === "force"}
        simulation={simulation}
        linkRef={linkRef}
      />
      <GraphD3NodeLayer
        simNodes={simNodes}
        nodeGroupRef={nodeGroupRef}
        hiddenNodeIds={hiddenNodeIds}
        setHiddenNodeIds={setHiddenNodeIds}
        setContextNodeId={setContextNodeId}
        setHoveredNodeId={setHoveredNodeId}
        onNodeKeydown={undefined}
      />
    </svg>
  );
};

export default GraphD3SvgFrame;
