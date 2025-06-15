import React from "react";
import { GraphNode } from "@/state/useGraphStore";
import AttributeTooltip from "./AttributeTooltip";

type GraphTooltipManagerProps = {
  node?: GraphNode | null;
};

const GraphTooltipManager: React.FC<GraphTooltipManagerProps> = ({ node }) => {
  // We keep the same fade-in logic as before (managed in AttributeTooltip)
  return <AttributeTooltip node={node ?? undefined} />;
};

export default GraphTooltipManager;
