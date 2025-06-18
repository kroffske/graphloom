import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import AppearancePresetDropdown from '@/components/AppearancePresetDropdown';
import { useAppearanceManager } from '@/hooks/appearance/useAppearanceManager';
import { useGraphStore } from '@/state/useGraphStore';
import { Switch } from '@/components/ui/switch';
import { CollapsibleSubsection } from './CollapsibleSubsection';
import { Palette, Eye, Settings2 } from 'lucide-react';

export const AppearanceSettingsSection: React.FC = () => {
  const {
    displayedPresets,
    selectedPresetKey,
    handlePresetSelect,
    isPresetDirty,
    savePresetChanges,
    revertPresetChanges,
  } = useAppearanceManager();

  const {
    showEdgeLabels,
    toggleEdgeLabels,
    showIsolatedNodes,
    toggleIsolatedNodes,
  } = useGraphStore();

  return (
    <div className="space-y-3">
      {/* Presets Subsection */}
      <CollapsibleSubsection
        title="Presets"
        icon={<Palette className="h-4 w-4" />}
        defaultOpen={true}
      >
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium mb-2 block">Appearance Preset</Label>
            <AppearancePresetDropdown
              allPresets={displayedPresets}
              selectedPresetKey={selectedPresetKey}
              onPresetSelect={handlePresetSelect}
            />
          </div>
          {isPresetDirty && (
            <div className="flex gap-2">
              <Button
                onClick={savePresetChanges}
                size="sm"
                variant="default"
                className="flex-1"
              >
                Save Changes
              </Button>
              <Button
                onClick={revertPresetChanges}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                Revert
              </Button>
            </div>
          )}
        </div>
      </CollapsibleSubsection>

      {/* Display Options Subsection */}
      <CollapsibleSubsection
        title="Display Options"
        icon={<Eye className="h-4 w-4" />}
        defaultOpen={true}
      >
        <div className="space-y-3">
          {/* Edge Labels */}
          <div className="flex items-center justify-between">
            <Label htmlFor="edge-labels" className="text-sm">
              Show Edge Labels
            </Label>
            <Switch
              id="edge-labels"
              checked={showEdgeLabels}
              onCheckedChange={toggleEdgeLabels}
            />
          </div>

          {/* Show Isolated Nodes */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isolated-nodes" className="text-sm">
              Show Isolated Nodes
            </Label>
            <Switch
              id="isolated-nodes"
              checked={showIsolatedNodes}
              onCheckedChange={toggleIsolatedNodes}
            />
          </div>
        </div>
      </CollapsibleSubsection>
    </div>
  );
};