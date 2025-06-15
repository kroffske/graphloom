
import React from "react";
import GraphNodeBox from "./GraphNodeBox";

type GraphFlowNodeProps = {
  id: string;
  data: { nodeId: string };
  selected?: boolean;
  setHoveredNodeId?: (id: string | null) => void;
  onSelect?: (id: string) => void;
};

const GraphFlowNode: React.FC<GraphFlowNodeProps> = ({
  id,
  data,
  selected,
  setHoveredNodeId,
  onSelect,
}) => {
  return (
    <div
      onMouseEnter={() => setHoveredNodeId?.(data.nodeId)}
      onMouseLeave={() => setHoveredNodeId?.(null)}
      style={{ width: "auto", height: "auto", background: "transparent", border: "none" }}
      tabIndex={-1}
      data-node-id={data.nodeId}
      className="nodrag"
    >
      <GraphNodeBox nodeId={data.nodeId} selected={selected} onSelect={onSelect} />
    </div>
  );
};

export default GraphFlowNode;
