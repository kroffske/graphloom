
import React from "react";
import { useGraphStore } from "@/state/useGraphStore";
import GraphNodeBox from "./GraphNodeBox";

type GraphNodeRendererProps = {
  nodeId: string;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
};

const GraphNodeRenderer: React.FC<GraphNodeRendererProps> = ({
  nodeId,
  selected,
  onSelect,
  onHover,
}) => {
  const { nodes } = useGraphStore();
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;
  return (
    <div
      onMouseEnter={() => onHover?.(nodeId)}
      onMouseLeave={() => onHover?.(null)}
    >
      <GraphNodeBox nodeId={nodeId} selected={selected} onSelect={onSelect} />
    </div>
  );
};

export default GraphNodeRenderer;
