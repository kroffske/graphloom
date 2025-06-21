import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Users, User } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useGraphStore } from "@/state/useGraphStore";
import { useAppearanceManager } from "@/hooks/appearance/useAppearanceManager";
import type { GraphEdge } from "@/types/graph.types";

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
          value={normalizedValue || "#64748b"}
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

interface EdgeSettingsFormV2Props {
  edge: GraphEdge;
}

export default function EdgeSettingsFormV2({ edge }: EdgeSettingsFormV2Props) {
  const { edges, setEdgeAppearance } = useGraphStore();
  const { updateEdgeTypeAppearance } = useAppearanceManager();

  // Toggle state for single edge vs all edges of type
  const [applyToAllOfType, setApplyToAllOfType] = useState(true);
  
  // Store original appearance for the current edge
  const [originalAppearance, setOriginalAppearance] = useState(() => edge.appearance ? { ...edge.appearance } : {});
  
  // Local state for preview
  const [previewAppearance, setPreviewAppearance] = useState(() => edge.appearance ? { ...edge.appearance } : {});
  const [isDirty, setIsDirty] = useState(false);
  
  // Keep track of the previous edge ID
  const prevEdgeIdRef = useRef(edge.id);
  
  // Count edges of same type
  const edgesOfSameType = edges.filter(e => e.type === edge.type).length;

  // Cancel any unsaved changes when edge changes
  useEffect(() => {
    if (edge.id !== prevEdgeIdRef.current) {
      // If there were unsaved changes on the previous edge, revert them
      if (isDirty) {
        // Revert all edges of the previous type if that was the setting
        const prevEdge = edges.find(e => e.id === prevEdgeIdRef.current);
        if (prevEdge) {
          if (applyToAllOfTypeRef.current) {
            edges.forEach(e => {
              if (e.type === prevEdge.type) {
                setEdgeAppearance(e.id, originalAppearance);
              }
            });
          } else {
            setEdgeAppearance(prevEdgeIdRef.current, originalAppearance);
          }
        }
      }
      
      // Update the ref
      prevEdgeIdRef.current = edge.id;
      
      // Set up for the new edge
      const newAppearance = edge.appearance ? { ...edge.appearance } : {};
      setOriginalAppearance(newAppearance);
      setPreviewAppearance(newAppearance);
      setIsDirty(false);
    }
  }, [edge.id, edge.appearance, edges, isDirty, originalAppearance, setEdgeAppearance]);

  // Store applyToAllOfType in a ref to avoid stale closure issues
  const applyToAllOfTypeRef = useRef(applyToAllOfType);
  useEffect(() => {
    applyToAllOfTypeRef.current = applyToAllOfType;
  }, [applyToAllOfType]);

  // Update preview on edge(s) for real-time visualization
  const applyPreview = useCallback((appearance: typeof previewAppearance, useCurrentSettings = true) => {
    const applyToAll = useCurrentSettings ? applyToAllOfTypeRef.current : true;
    
    if (applyToAll) {
      // Update all edges of the same type
      edges.forEach(e => {
        if (e.type === edge.type) {
          setEdgeAppearance(e.id, appearance);
        }
      });
    } else {
      // Update only this edge
      setEdgeAppearance(edge.id, appearance);
    }
  }, [edge.id, edge.type, edges, setEdgeAppearance]);

  const updateAppearance = useCallback((key: string, value: string | number | boolean | undefined) => {
    const newAppearance = { ...previewAppearance, [key]: value };
    setPreviewAppearance(newAppearance);
    setIsDirty(true);
    // Apply preview immediately
    applyPreview(newAppearance);
  }, [previewAppearance, applyPreview]);

  const handleSave = () => {
    if (applyToAllOfType && edge.type) {
      // Save to edge type appearance
      updateEdgeTypeAppearance(edge.type, previewAppearance);
      toast.success(`Appearance saved for all ${edge.type} edges!`);
    } else {
      // Save only to this specific edge
      setEdgeAppearance(edge.id, previewAppearance);
      toast.success("Edge appearance saved!");
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
      name: `Edge ${edge.type || 'Default'} Appearance`,
      type: edge.type || 'default',
      timestamp: new Date().toISOString(),
      appearance: previewAppearance,
      modified: isDirty,
      edge: {
        source: edge.source,
        target: edge.target
      }
    };

    // Convert to JSON
    const json = JSON.stringify(preset, null, 2);
    
    // Create blob and download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appearance-edge-${edge.type || 'default'}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Edge appearance settings downloaded!');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Edge Info with download button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <div>From: <span className="font-medium text-foreground">{edge.source}</span></div>
          <div>To: <span className="font-medium text-foreground">{edge.target}</span></div>
          {edge.type && <div>Type: <span className="font-medium text-foreground">{edge.type}</span></div>}
        </div>
        <Button
          onClick={handleDownload}
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          title="Download appearance settings"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Apply to all toggle */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 flex-1">
          <Label htmlFor="apply-to-all" className="text-sm font-medium cursor-pointer flex items-center gap-2">
            {applyToAllOfType ? (
              <>
                <Users className="h-4 w-4" />
                Apply to all {edge.type || 'default'} edges ({edgesOfSameType})
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                Apply to this edge only
              </>
            )}
          </Label>
        </div>
        <Switch
          id="apply-to-all"
          checked={applyToAllOfType}
          onCheckedChange={setApplyToAllOfType}
        />
      </div>

      {/* Color */}
      <ColorSwatchInput
        label="Edge Color"
        value={previewAppearance.color || '#64748b'}
        onChange={v => updateAppearance('color', v)}
        id="edge-color"
      />

      {/* Width */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Width ({previewAppearance.width || 2}px)
        </Label>
        <Slider
          min={1}
          max={10}
          step={0.5}
          value={[previewAppearance.width || 2]}
          onValueChange={([width]) => updateAppearance('width', width)}
          className="w-full"
        />
      </div>

      {/* Opacity */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Opacity ({Math.round((previewAppearance.opacity || 0.6) * 100)}%)
        </Label>
        <Slider
          min={10}
          max={100}
          step={5}
          value={[(previewAppearance.opacity || 0.6) * 100]}
          onValueChange={([opacity]) => updateAppearance('opacity', opacity / 100)}
          className="w-full"
        />
      </div>

      {/* Style */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Style</Label>
        <Select
          value={previewAppearance.strokeDasharray ? 'dashed' : 'solid'}
          onValueChange={(value) => {
            if (value === 'dashed') {
              updateAppearance('strokeDasharray', '5,5');
            } else {
              updateAppearance('strokeDasharray', undefined);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Arrow Toggle */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Show Arrows</Label>
          <Switch
            checked={previewAppearance.showArrows ?? false}
            onCheckedChange={v => updateAppearance('showArrows', v)}
          />
        </div>
        {previewAppearance.showArrows && edge.attributes?.direction && (
          <p className="text-xs text-muted-foreground">
            Direction: {edge.attributes.direction as string}
          </p>
        )}
      </div>

      {/* Label */}
      <div>
        <Label htmlFor="edge-label" className="text-sm font-medium mb-1 block">
          Label
        </Label>
        <Input
          id="edge-label"
          value={previewAppearance.label || ''}
          onChange={(e) => updateAppearance('label', e.target.value)}
          placeholder="Edge label"
          className="h-8"
        />
      </div>

      {/* Label Template */}
      <div>
        <Label htmlFor="edge-label-template" className="text-sm font-medium mb-1 block">
          Label Template
        </Label>
        <Input
          id="edge-label-template"
          value={previewAppearance.labelTemplate || ''}
          onChange={(e) => updateAppearance('labelTemplate', e.target.value)}
          placeholder="{edge_type}\n{source} -> {target}"
          className="h-8"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use {'{property}'} to insert values. Use \n for new lines.
        </p>
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