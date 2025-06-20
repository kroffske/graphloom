import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useIconRegistry } from "./IconRegistry";
import { useGraphStore } from "@/state/useGraphStore";
import { useAppearanceManager } from "@/hooks/appearance/useAppearanceManager";
import type { GraphNode } from "@/types/graph.types";

// Helper to convert 8-digit hex to 6-digit hex
function normalizeHexColor(color: string): string {
  if (!color) return '';
  // Remove # if present
  const hex = color.replace('#', '');
  // If 8 digits (RRGGBBAA), take first 6
  if (hex.length === 8) {
    return `#${hex.substring(0, 6)}`;
  }
  // If already 6 digits, add #
  if (hex.length === 6) {
    return `#${hex}`;
  }
  return color;
}

// Color input component
function ColorSwatchInput({ 
  label, 
  value, 
  onChange, 
  id 
}: { 
  label: string;
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  const normalizedValue = normalizeHexColor(value);
  
  return (
    <div>
      <Label htmlFor={id} className="mb-1 text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={normalizedValue || "#000000"}
          className="w-8 h-8 border rounded cursor-pointer"
          onChange={(e) => {
            onChange(normalizeHexColor(e.target.value));
          }}
        />
        <Input
          id={id + "-hex"}
          className="h-8 text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#RRGGBB"
        />
      </div>
    </div>
  );
}

interface NodeSettingsFormV2Props {
  node: GraphNode;
}

export default function NodeSettingsFormV2({ node }: NodeSettingsFormV2Props) {
  const { updateNodeAppearance } = useGraphStore();
  const { updateNodeTypeAppearance } = useAppearanceManager();
  const iconRegistry = useIconRegistry();
  const allIconKeys = Object.keys(iconRegistry);

  // Store original appearance
  const [originalAppearance] = useState(() => ({ ...node.appearance } || {}));
  
  // Local state for preview
  const [previewAppearance, setPreviewAppearance] = useState(() => ({ ...node.appearance } || {}));
  const [isDirty, setIsDirty] = useState(false);

  // Reset when node changes (different node selected)
  useEffect(() => {
    if (node.id) {
      const newAppearance = { ...node.appearance } || {};
      setPreviewAppearance(newAppearance);
      setIsDirty(false);
    }
  }, [node.id]);

  // Update preview on node for real-time visualization
  const applyPreview = useCallback((appearance: typeof previewAppearance) => {
    updateNodeAppearance(node.id, appearance);
  }, [node.id, updateNodeAppearance]);

  const updateAppearance = useCallback((key: string, value: string | number | boolean | undefined) => {
    const newAppearance = { ...previewAppearance, [key]: value };
    setPreviewAppearance(newAppearance);
    setIsDirty(true);
    // Apply preview immediately
    applyPreview(newAppearance);
  }, [previewAppearance, applyPreview]);

  const handleSave = () => {
    // Save to node type appearance
    updateNodeTypeAppearance(node.type, previewAppearance);
    setIsDirty(false);
    toast.success("Appearance saved!");
  };

  const handleCancel = () => {
    // Revert to original appearance
    setPreviewAppearance(originalAppearance);
    applyPreview(originalAppearance);
    setIsDirty(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Icon Selection */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Icon</Label>
        <ScrollArea className="h-[200px] w-full rounded-md border p-2">
          <div className="grid grid-cols-4 gap-2">
            {allIconKeys.map(iconKey => {
              const Icon = iconRegistry[iconKey];
              const isSelected = (previewAppearance.icon || node.type) === iconKey;
              return (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => updateAppearance('icon', iconKey)}
                  className={`
                    p-2 rounded-md border transition-colors
                    ${isSelected 
                      ? 'bg-primary/20 border-primary' 
                      : 'hover:bg-muted border-transparent'
                    }
                  `}
                  title={iconKey}
                >
                  <Icon 
                    filled={isSelected} 
                    className="w-6 h-6 mx-auto" 
                    aria-label={iconKey} 
                  />
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Size Slider */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Size ({previewAppearance.size || 38}px)
        </Label>
        <Slider
          min={20}
          max={100}
          step={2}
          value={[previewAppearance.size || 38]}
          onValueChange={([size]) => updateAppearance('size', size)}
          className="w-full"
        />
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <ColorSwatchInput
          label="Background"
          value={previewAppearance.backgroundColor || ''}
          onChange={v => updateAppearance('backgroundColor', v)}
          id="bg-color"
        />
        <ColorSwatchInput
          label="Border"
          value={previewAppearance.borderColor || '#e5e7eb'}
          onChange={v => updateAppearance('borderColor', v)}
          id="border-color"
        />
      </div>

      {/* Border Settings */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Show Border</Label>
          <Switch
            checked={previewAppearance.borderEnabled ?? true}
            onCheckedChange={v => updateAppearance('borderEnabled', v)}
          />
        </div>
        {previewAppearance.borderEnabled && (
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Border Width ({previewAppearance.borderWidth || 2}px)
            </Label>
            <Slider
              min={1}
              max={8}
              step={0.5}
              value={[previewAppearance.borderWidth || 2]}
              onValueChange={([width]) => updateAppearance('borderWidth', width)}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Save/Cancel Buttons */}
      {isDirty && (
        <div className="flex gap-2 pt-2 border-t">
          <Button 
            onClick={handleSave}
            size="sm"
            className="flex-1"
          >
            Save Changes
          </Button>
          <Button 
            onClick={handleCancel}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}