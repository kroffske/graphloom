
import React from "react";
import { Button } from "@/components/ui/button";

type TabKey = string;
interface TabDef {
  key: TabKey;
  label: string;
}

interface InspectorPanelTabsProps {
  value: TabKey;
  onChange: (tab: TabKey) => void;
  extraTabs?: TabDef[];
}

const BASE_TABS: TabDef[] = [
  { key: "details", label: "Details" },
  { key: "settings", label: "Settings" },
];

const InspectorPanelTabs: React.FC<InspectorPanelTabsProps> = ({
  value,
  onChange,
  extraTabs = [],
}) => {
  const allTabs = [...BASE_TABS, ...extraTabs];
  return (
    <div className="flex gap-2 mb-2">
      {allTabs.map(({ key, label }) => (
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
};

export default InspectorPanelTabs;
