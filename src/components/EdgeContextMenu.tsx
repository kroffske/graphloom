
import React from "react";
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
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!edge) return null;

  // Example action: select the edge
  function handleShowDetails() {
    selectEdge(edge.id);
    onClose();
  }

  // A simple MenuItem component to mimic Radix/shadcn's
  const MenuItem = ({ children, onSelect }: { children: React.ReactNode, onSelect: () => void }) => (
    <button
      onClick={onSelect}
      className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
    >
      {children}
    </button>
  );

  // This component now uses plain divs and buttons styled to look like a context menu,
  // avoiding the Radix context issue.
  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[240px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80"
      style={{
        top: y + 2,
        left: x + 2,
        pointerEvents: "auto",
      }}
      tabIndex={-1}
    >
        <div className="px-2 py-1.5 text-sm font-semibold text-foreground">Edge Menu</div>
        <MenuItem onSelect={handleShowDetails}>
          Show Details & Settings
        </MenuItem>
        <div className="-mx-1 my-1 h-px bg-border" />
        <div className="px-2 pt-1 pb-2">
          <EdgeDetailsDisplay edge={edge} />
        </div>
        <div className="px-2 pb-2 border-t border-border">
          <EdgeSettingsForm edge={edge} />
        </div>
    </div>
  );
};

export default EdgeContextMenu;
