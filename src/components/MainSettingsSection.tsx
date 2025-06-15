import React from "react";
import { Settings } from "lucide-react";
import GlobalSettingsSection from "@/components/GlobalSettingsSection";
type MainSettingsSectionProps = {
  onFillExample: () => void;
};
const MainSettingsSection: React.FC<MainSettingsSectionProps> = ({
  onFillExample
}) => {
  // Removed outer <div> but kept all child elements directly
  return <>
      
      <div className="flex-1 w-full min-h-0 mt-1">
        <GlobalSettingsSection onFillExample={onFillExample} />
      </div>
    </>;
};
export default MainSettingsSection;