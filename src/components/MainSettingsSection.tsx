
import React from "react";
import { Settings } from "lucide-react";
import GlobalSettingsSection from "@/components/GlobalSettingsSection";

type MainSettingsSectionProps = {
  onFillExample: () => void;
};

const MainSettingsSection: React.FC<MainSettingsSectionProps> = ({ onFillExample }) => {
  return (
    <div className="w-full md:w-[650px] max-w-4xl min-w-[340px] flex flex-col gap-3 mx-auto">
      <div className="flex items-center gap-2 mb-2 mt-3">
        <Settings className="w-5 h-5 text-muted-foreground" />
        <span className="font-bold text-xl tracking-wide">Appearance</span>
      </div>
      <div className="flex-1 w-full min-h-0 mt-1">
        <GlobalSettingsSection onFillExample={onFillExample} />
      </div>
    </div>
  );
};

export default MainSettingsSection;
