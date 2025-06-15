
import React from "react";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import { useGraphStore } from "@/state/useGraphStore";
import EdgeDetailsDisplay from "./EdgeDetailsDisplay";
import EdgeSettingsForm from "./EdgeSettingsForm";

// Get the edge object by ID from the store (for details and actions)
function useEdgeById(edgeId: string) {
  const { edges } = useGraphStore();
  return edges.find((e) => e.id === edgeId);
}

type EdgeContextMenuProps = {
  edgeId: string;
  x: number;
  y: number;
  onClose: () => void;
};

const EdgeContextMenu: React.FC<EdgeContextMenuProps> = ({ edgeId, x, y, onClose }) => {
  const { selectEdge } = useGraphStore();
  const edge = useEdgeById(edgeId);

  if (!edge) return null;

  // Example action: select the edge
  function handleShowDetails() {
    selectEdge(edge.id);
    onClose();
  }

  // Example: Delete edge handler (not implemented)
  // function handleDelete() {
  //   // You could add: removeEdge(edge.id);
  //   onClose();
  // }

  // Render a floating menu like Radix's ContextMenuContent at x,y
  // We do not use ContextMenu root here, simply render content as a floating div
  return (
    <div
      className="fixed z-50"
      style={{
        top: y + 2,
        left: x + 2,
        pointerEvents: "auto",
        minWidth: 240,
      }}
      tabIndex={-1}
      onBlur={onClose}
    >
      <ContextMenuContent
        side="right"
        align="start"
        forceMount
        onInteractOutside={onClose}
        className="rounded-lg shadow-xl border bg-popover"
      >
        <ContextMenuLabel className="font-semibold text-xs">Edge Menu</ContextMenuLabel>
        <ContextMenuItem onSelect={handleShowDetails}>
          Show Details & Settings
        </ContextMenuItem>
        {/* Example: quick future actions */}
        {/* <ContextMenuItem onSelect={handleDelete} className="text-red-500">Delete Edge</ContextMenuItem> */}
        <ContextMenuSeparator />
        {/* Inline edge details */}
        <div className="px-2 pt-1 pb-2">
          <EdgeDetailsDisplay edge={edge} />
        </div>
        <div className="px-2 pb-2 border-t border-border">
          <EdgeSettingsForm edge={edge} />
        </div>
      </ContextMenuContent>
    </div>
  );
};

export default EdgeContextMenu;
