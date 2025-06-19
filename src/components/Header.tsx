import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Upload, Settings } from "lucide-react";

interface HeaderProps {
  onUploadClick: () => void;
  onSettingsClick: () => void;
}

export function Header({ onUploadClick, onSettingsClick }: HeaderProps) {
  return (
    <header className="h-14 px-4 flex items-center justify-between border-b bg-background">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Icon Graph Explorer</h1>
        <span className="text-xs text-muted-foreground">v0.1.0</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUploadClick}
          title="Upload Data"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsClick}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <div className="ml-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}