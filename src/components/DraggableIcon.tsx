
import React, { useRef, useState } from "react";

type DraggableIconProps = {
  Icon: React.ComponentType<{ filled?: boolean; className?: string; "aria-label"?: string }>;
  filled?: boolean;
  size?: number;
  "aria-label"?: string;
  onSelect?: () => void;
  selected?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLButtonElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLButtonElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLButtonElement>) => void;
};

/**
 * DraggableIcon renders an icon that supports independent drag state and interactions.
 */
const DraggableIcon: React.FC<DraggableIconProps> = ({
  Icon,
  filled,
  size = 28,
  "aria-label": ariaLabel,
  onSelect,
  selected,
  draggable = true,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}) => {
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      type="button"
      ref={ref}
      aria-label={ariaLabel}
      className={`
        flex items-center justify-center rounded border-2 p-2
        ${selected ? "border-primary" : "border-muted"}
        bg-background hover:bg-accent
        ${dragging ? "ring-2 ring-blue-400 shadow-lg scale-110 z-10" : ""}
        transition-all
      `}
      draggable={draggable}
      onClick={onSelect}
      onDragStart={e => {
        setDragging(true);
        if (onDragStart) onDragStart(e);
      }}
      onDragEnd={e => {
        setDragging(false);
        if (onDragEnd) onDragEnd(e);
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        opacity: dragging ? 0.7 : 1,
        cursor: "grab",
        touchAction: "none",
      }}
    >
      <Icon className="w-7 h-7" filled={filled} />
    </button>
  );
};

export default DraggableIcon;
