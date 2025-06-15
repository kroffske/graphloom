
import React from "react";
import { Settings } from "lucide-react";
import GlobalSettingsSection from "@/components/GlobalSettingsSection";
type MainSettingsSectionProps = {
  onFillExample: () => void;
};
const MainSettingsSection: React.FC<MainSettingsSectionProps> = ({
  onFillExample
}) => {
  // Make sure to use flex-1 and min-h-0 to fill parent container
  return (
    <div className="flex-1 w-full min-h-0 mt-1 flex flex-col">
      <GlobalSettingsSection onFillExample={onFillExample} />
    </div>
  );
};
export default MainSettingsSection;
