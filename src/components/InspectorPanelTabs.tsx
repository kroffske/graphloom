
import React from "react";
import { Button } from "@/components/ui/button";

// Support both node and edge tabs
type Tab = "details" | "settings";
const TABS: { key: Tab; label: string }[] = [
  { key: "details", label: "Details" },
  { key: "settings", label: "Settings" },
];

interface InspectorPanelTabsProps {
  value: Tab;
  onChange: (tab: Tab) => void;
}

const InspectorPanelTabs: React.FC<InspectorPanelTabsProps> = ({ value, onChange }) => (
  <div className="flex gap-2 mb-2">
    {TABS.map(({ key, label }) => (
      <Button
        key={key}
        type="button"
        variant={value === key ? "default" : "outline"}
        size="sm"
        className={`rounded-full px-4 py-1 text-sm capitalize transition-all`}
        onClick={() => onChange(key)}
      >
        {label}
      </Button>
    ))}
  </div>
);

export default InspectorPanelTabs;
