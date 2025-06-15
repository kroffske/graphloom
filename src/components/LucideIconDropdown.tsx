
import React from "react";
import { User, AlertCircle, Activity } from "lucide-react";

// Map of icon names to React Components for dropdown select
const LUCIDE_ICONS = [
  { name: "user", Icon: User },
  { name: "alert-circle", Icon: AlertCircle },
  { name: "activity", Icon: Activity },
];

type Props = {
  value?: string;
  onChange?: (iconName: string) => void;
};

const LucideIconDropdown: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2 mt-4">
      <label className="text-sm font-medium">Lucide Icon:</label>
      <select
        className="input rounded px-2 py-1 bg-muted border"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        aria-label="Select Lucide icon"
      >
        {LUCIDE_ICONS.map(({ name }) => (
          <option value={name} key={name}>{name}</option>
        ))}
      </select>
      {LUCIDE_ICONS.find(ic => ic.name === value) && (
        <span className="ml-2">
          {React.createElement(
            LUCIDE_ICONS.find(ic => ic.name === value)!.Icon,
            { className: "w-6 h-6", color: "#222" }
          )}
        </span>
      )}
    </div>
  );
};

export default LucideIconDropdown;
