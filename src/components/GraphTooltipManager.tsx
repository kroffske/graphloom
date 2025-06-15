
import React from "react";
import type { GraphNode } from "@/types/graph";
import AttributeTooltip from "./AttributeTooltip";

type GraphTooltipManagerProps = {
  node?: GraphNode | null;
};

const GraphTooltipManager: React.FC<GraphTooltipManagerProps> = ({ node }) => {
  // We keep the same fade-in logic as before (managed in AttributeTooltip)
  return <AttributeTooltip node={node ?? undefined} />;
};

export default GraphTooltipManager;
