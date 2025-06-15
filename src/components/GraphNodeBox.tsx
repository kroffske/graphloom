
import React from "react";
import { useGraphStore } from "@/state/useGraphStore";
import { useIconRegistry } from "./IconRegistry";

type GraphNodeBoxProps = {
  nodeId: string;
  selected?: boolean;
  onSelect?: (nodeId: string) => void;
};

const GraphNodeBox: React.FC<GraphNodeBoxProps> = ({
  nodeId,
  selected,
  onSelect,
}) => {
  const { nodes, selectNode } = useGraphStore();
  const iconRegistry = useIconRegistry();
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;
  const Icon = iconRegistry[node.type];

  return (
    <div
      className={`flex flex-col items-center px-3 py-2 rounded-lg shadow-md cursor-pointer outline-none border-2 ${
        selected
          ? "border-primary ring-2 ring-blue-300"
          : "border-transparent"
      } bg-white dark:bg-card`}
      tabIndex={0}
      role="button"
      aria-label={node.label || "Node"}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          (onSelect || selectNode)(node.id);
        }
      }}
      onClick={() => (onSelect || selectNode)(node.id)}
      style={{ minWidth: 64, minHeight: 64, outline: "none" }}
    >
      {Icon && (
        <Icon className="w-8 h-8 mb-1" aria-label={node.type} filled={false} />
      )}
      <span className="text-xs font-medium truncate max-w-[80px] text-foreground">
        {node.label}
      </span>
    </div>
  );
};

export default GraphNodeBox;
