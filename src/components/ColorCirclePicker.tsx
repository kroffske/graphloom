
import React from "react";

// Common palette, can be extended or passed as prop
const COLORS = [
  "#e94f37", "#f6c85f", "#6a4c93", "#3483eb",
  "#43b929", "#a259f7", "#00897b", "#ef476f",
  "#ffd166", "#3aafa9", "#1fab89", "#3a3c3f", "#ededed", "#222", "#fff"
];

export type ColorCirclePickerProps = {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
  className?: string;
  showCustom?: boolean;
};

const ColorCirclePicker: React.FC<ColorCirclePickerProps> = ({
  value,
  onChange,
  colors = COLORS,
  className = "",
  showCustom = true,
}) => {
  return (
    <div className={`flex items-center flex-wrap gap-2 ${className}`}>
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={c}
          className={`
            rounded-full w-7 h-7 border-2
            ${value === c
              ? "border-blue-500 ring-2 ring-blue-300"
              : "border-muted"}
            transition-all
          `}
          style={{ background: c }}
          onClick={() => onChange(c)}
        />
      ))}
      {showCustom && (
        <input
          aria-label="Custom Color"
          type="color"
          className="w-7 h-7 p-0 border border-muted rounded-full cursor-pointer bg-transparent"
          value={value && /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(value) ? value : "#ffffff"}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </div>
  );
};

export default ColorCirclePicker;
