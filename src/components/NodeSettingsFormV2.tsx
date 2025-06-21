import React, { useState, useEffect, useCallback, useRef } from "react";
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
import type { GraphNode } from "@/types/graph";
import { Users, User, Download } from "lucide-react";

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
  const { nodes, updateNodeAppearance } = useGraphStore();
  const { updateNodeTypeAppearance } = useAppearanceManager();
  const iconRegistry = useIconRegistry();
  const allIconKeys = Object.keys(iconRegistry);

  // Toggle state for single node vs all nodes of type
  const [applyToAllOfType, setApplyToAllOfType] = useState(true);
  
  // Store original appearance for the current node
  const [originalAppearance, setOriginalAppearance] = useState(() => ({ ...node.appearance } || {}));
  
  // Local state for preview
  const [previewAppearance, setPreviewAppearance] = useState(() => ({ ...node.appearance } || {}));
  const [isDirty, setIsDirty] = useState(false);

  // Keep track of the previous node ID
  const prevNodeIdRef = useRef(node.id);

  // Count nodes of same type
  const nodesOfSameType = nodes.filter(n => n.type === node.type).length;

  // Update preview on node(s) for real-time visualization
  const applyPreview = useCallback((appearance: typeof previewAppearance, useCurrentSettings = true) => {
    const applyToAll = useCurrentSettings ? applyToAllOfType : true; // When reverting, apply to all if that was the setting
    
    if (applyToAll) {
      // Update all nodes of the same type
      nodes.forEach(n => {
        if (n.type === node.type) {
          updateNodeAppearance(n.id, appearance);
        }
      });
    } else {
      // Update only this node
      updateNodeAppearance(node.id, appearance);
    }
  }, [node.id, node.type, nodes, updateNodeAppearance, applyToAllOfType]);

  // Cancel any unsaved changes when node changes
  useEffect(() => {
    if (node.id !== prevNodeIdRef.current) {
      // If there were unsaved changes on the previous node, revert them
      if (isDirty) {
        // Revert all nodes of the previous type if that was the setting
        const prevNode = nodes.find(n => n.id === prevNodeIdRef.current);
        if (prevNode) {
          if (applyToAllOfType) {
            nodes.forEach(n => {
              if (n.type === prevNode.type) {
                updateNodeAppearance(n.id, originalAppearance);
              }
            });
          } else {
            updateNodeAppearance(prevNodeIdRef.current, originalAppearance);
          }
        }
      }
      
      // Update the ref
      prevNodeIdRef.current = node.id;
      
      // Set up for the new node
      const newAppearance = { ...node.appearance } || {};
      setOriginalAppearance(newAppearance);
      setPreviewAppearance(newAppearance);
      setIsDirty(false);
    }
  }, [node.id, nodes, isDirty, originalAppearance, applyToAllOfType, updateNodeAppearance]);

  const updateAppearance = useCallback((key: string, value: string | number | boolean | undefined) => {
    const newAppearance = { ...previewAppearance, [key]: value };
    setPreviewAppearance(newAppearance);
    setIsDirty(true);
    // Apply preview immediately
    applyPreview(newAppearance);
  }, [previewAppearance, applyPreview]);

  const handleSave = () => {
    if (applyToAllOfType) {
      // Save to node type appearance
      updateNodeTypeAppearance(node.type, previewAppearance);
      toast.success(`Appearance saved for all ${node.type} nodes!`);
    } else {
      // Save only to this specific node
      updateNodeAppearance(node.id, previewAppearance);
      toast.success("Node appearance saved!");
    }
    setOriginalAppearance(previewAppearance);
    setIsDirty(false);
  };

  const handleCancel = () => {
    // Revert to original appearance
    setPreviewAppearance(originalAppearance);
    applyPreview(originalAppearance);
    setIsDirty(false);
  };

  const handleDownload = () => {
    // Create appearance preset object
    const preset = {
      name: `${node.type} Appearance`,
      type: node.type,
      timestamp: new Date().toISOString(),
      appearance: previewAppearance,
      modified: isDirty
    };

    // Convert to JSON
    const json = JSON.stringify(preset, null, 2);
    
    // Create blob and download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appearance-${node.type}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Appearance settings downloaded!');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Apply to all toggle with download button */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 flex-1">
          <Label htmlFor="apply-to-all" className="text-sm font-medium cursor-pointer flex items-center gap-2">
            {applyToAllOfType ? (
              <>
                <Users className="h-4 w-4" />
                Apply to all {node.type} nodes ({nodesOfSameType})
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                Apply to this node only
              </>
            )}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownload}
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Download appearance settings"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Switch
            id="apply-to-all"
            checked={applyToAllOfType}
            onCheckedChange={setApplyToAllOfType}
          />
        </div>
      </div>

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

      {/* Node Size Slider */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Node Size ({previewAppearance.size || 38}px)
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

      {/* Icon Size Slider */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Icon Size ({previewAppearance.iconSize || 70}%)
        </Label>
        <Slider
          min={40}
          max={120}
          step={5}
          value={[previewAppearance.iconSize || 70]}
          onValueChange={([iconSize]) => updateAppearance('iconSize', iconSize)}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Adjusts icon size within the node circle
        </p>
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

      {/* Save/Cancel Buttons - Always visible */}
      <div className="flex gap-2 pt-2 border-t">
        <Button 
          onClick={handleSave}
          size="sm"
          className="flex-1"
          variant={isDirty ? "default" : "outline"}
          disabled={!isDirty}
        >
          Save Changes
        </Button>
        <Button 
          onClick={handleCancel}
          size="sm"
          variant="outline"
          className="flex-1"
          disabled={!isDirty}
        >
          Cancel
        </Button>
      </div>
      
      {/* Status indicator */}
      {isDirty && (
        <p className="text-xs text-muted-foreground text-center">
          You have unsaved changes
        </p>
      )}
    </div>
  );
}