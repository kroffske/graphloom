
import React, { useState } from "react";
import { reorder } from "@/utils/arrayHelpers";
import DraggableIcon from "./DraggableIcon";

type IconPickerProps = {
  iconRegistry: Record<string, React.ComponentType<any>>;
  value?: string;
  onChange: (v: string) => void;
  order: string[];
  setOrder: (arr: string[]) => void;
};

const IconPicker: React.FC<IconPickerProps> = ({
  iconRegistry,
  value,
  onChange,
  order,
  setOrder,
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-3 gap-2 mt-2 relative select-none">
      {order.map((k, idx) => {
        const Icon = iconRegistry[k];
        const isDragging = dragIndex === idx;
        const isDropTarget =
          dragOverIndex === idx && dragIndex !== null && dragIndex !== dragOverIndex;
        return (
          <div
            key={k}
            className={`
              relative
              ${isDropTarget ? "ring-2 ring-blue-400 z-20" : ""}
              ${isDragging ? "opacity-0" : ""}
            `}
            onDragOver={e => {
              e.preventDefault();
              if (dragIndex !== null && dragOverIndex !== idx) setDragOverIndex(idx);
            }}
            onDrop={e => {
              e.preventDefault();
              if (dragIndex !== null && dragIndex !== idx) {
                setOrder(reorder(order, dragIndex, idx));
                setDragIndex(null);
                setDragOverIndex(null);
              }
            }}
            onDragLeave={_ => {
              if (dragOverIndex === idx) setDragOverIndex(null);
            }}
          >
            <DraggableIcon
              Icon={Icon}
              aria-label={k}
              filled={value === k}
              selected={value === k}
              onSelect={() => onChange(k)}
              draggable
              onDragStart={e => {
                setDragIndex(idx);
                setDragOverIndex(idx);
                const ghost = document.createElement("div");
                ghost.style.position = "absolute";
                ghost.style.left = "-9999px";
                document.body.appendChild(ghost);
                e.dataTransfer.setDragImage(ghost, 0, 0);
              }}
              onDragEnd={_ => {
                setDragIndex(null);
                setDragOverIndex(null);
                setTimeout(() => {
                  const ghosts = document.querySelectorAll("body > div");
                  ghosts.forEach((g) => {
                    if ((g as HTMLElement).style.position === "absolute" && (g as HTMLElement).style.left === "-9999px") {
                      g.remove();
                    }
                  });
                }, 10);
              }}
            />
            {isDropTarget && (
              <div
                className="absolute inset-0 rounded border-2 border-blue-500 pointer-events-none z-30"
                style={{ borderStyle: "dashed" }}
              />
            )}
          </div>
        );
      })}
      <div className="col-span-3 text-xs text-muted-foreground mt-2">
        Drag and drop to reorder icons within the grid.
      </div>
    </div>
  );
};

export default IconPicker;
