
import React from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { useGraphStore } from "@/state/useGraphStore";

// Get all visible neighbours for a node (using edges)
function getNeighbourNodeIds(nodeId: string, edges: { source: string; target: string }[]) {
  const neighbours = new Set<string>();
  edges.forEach((e) => {
    if (e.source === nodeId) neighbours.add(e.target);
    if (e.target === nodeId) neighbours.add(e.source);
  });
  return Array.from(neighbours);
}

type GraphNodeContextMenuProps = {
  nodeId: string;
  isHidden: boolean;
  onHide: () => void;
  onUnhideNeighbours: () => void;
  onShowDetails: () => void;
  children: React.ReactNode;
};

export default function GraphNodeContextMenu({
  nodeId,
  isHidden,
  onHide,
  onUnhideNeighbours,
  onShowDetails,
  children,
}: GraphNodeContextMenuProps) {
  // This wraps its children and enables right click AND Shift+F10 to open
  const triggerRef = React.useRef<HTMLDivElement>(null);

  // Keyboard: Shift+F10 opens context menu
  React.useEffect(() => {
    const ref = triggerRef.current;
    if (!ref) return;
    const handler = (e: KeyboardEvent) => {
      if (
        (e.shiftKey && e.key === "F10") ||
        (e.key === "ContextMenu" || e.key === "Apps")
      ) {
        e.preventDefault();
        ref.click();
      }
    };
    ref.addEventListener("keydown", handler);
    return () => ref.removeEventListener("keydown", handler);
  }, []);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        asChild
        ref={triggerRef}
        tabIndex={0}
        aria-label={"Open node menu"}
      >
        <div style={{ display: "contents" }}>{children}</div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        {!isHidden ? (
          <ContextMenuItem onSelect={onHide}>Hide</ContextMenuItem>
        ) : (
          <ContextMenuItem disabled>Hidden</ContextMenuItem>
        )}
        <ContextMenuItem onSelect={onUnhideNeighbours}>Unhide neighbours</ContextMenuItem>
        <ContextMenuItem onSelect={onShowDetails}>Details</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
