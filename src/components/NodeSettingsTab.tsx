
import React, { useState, useMemo } from "react";
import { useGraphStore, GraphNode } from "@/state/useGraphStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useIconRegistry } from "./IconRegistry";
import { Button } from "@/components/ui/button";

export default function NodeSettingsTab() {
  const { nodes, setNodes } = useGraphStore();
  const [selectedId, setSelectedId] = useState<string | null>(
    nodes.length ? nodes[0].id : null
  );
  const selectedNode: GraphNode | undefined = useMemo(
    () => nodes.find((n) => n.id === selectedId),
    [selectedId, nodes]
  );

  // Form state
  const [tab, setTab] = useState("general");

  // Local state mirrors selected node fields
  const [label, setLabel] = useState(selectedNode?.label ?? "");
  const [color, setColor] = useState(
    typeof selectedNode?.attributes.color === "string"
      ? selectedNode.attributes.color
      : ""
  );
  const [appearance, setAppearance] = useState<NonNullable<GraphNode["appearance"]>>(
    selectedNode?.appearance || {}
  );

  React.useEffect(() => {
    setLabel(selectedNode?.label ?? "");
    setColor(
      typeof selectedNode?.attributes.color === "string"
        ? selectedNode.attributes.color
        : ""
    );
    setAppearance(selectedNode?.appearance || {});
  }, [selectedNode?.label, selectedNode?.attributes.color, selectedNode?.appearance, selectedId]);

  // --- Icon Picker
  const iconRegistry = useIconRegistry();
  const iconKeys = Object.keys(iconRegistry);

  function IconPicker({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
    return (
      <div className="grid grid-cols-3 gap-2 mt-2">
        {iconKeys.map((k) => {
          const Icon = iconRegistry[k];
          return (
            <button
              type="button"
              key={k}
              onClick={() => onChange(k)}
              className={`flex items-center justify-center rounded border-2 p-2 ${
                value === k ? "border-primary" : "border-muted"
              } bg-background hover:bg-accent`}
              aria-label={k}
            >
              <Icon className="w-7 h-7" filled={value === k} />
            </button>
          );
        })}
      </div>
    );
  }

  // -- Node Save Handler
  function onSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!selectedNode) return;
    const newNodes = nodes.map((n) =>
      n.id === selectedNode.id
        ? {
            ...n,
            label,
            attributes: { ...n.attributes, color },
            appearance: { ...appearance },
          }
        : n
    );
    setNodes(newNodes);
    toast.success("Node settings saved!");
  }

  // List of all nodes for selection
  function NodeList() {
    return (
      <div className="w-full mb-5 flex flex-wrap gap-2">
        {nodes.length === 0 && <span className="text-muted-foreground text-sm">No nodes.</span>}
        {nodes.map((node) => {
          const Icon = iconRegistry[node.appearance?.icon || node.type] || iconRegistry[node.type];
          return (
            <button
              key={node.id}
              type="button"
              aria-label={node.label}
              className={`flex flex-col items-center border rounded-lg px-2 py-2 min-w-20 min-h-20 focus:outline-none cursor-pointer transition-all
                ${selectedId === node.id ? "border-primary ring-2 ring-primary" : "border-muted"}
                bg-card`}
              onClick={() => setSelectedId(node.id)}
            >
              {Icon && <Icon className="w-7 h-7 mb-1" filled={selectedId === node.id} />}
              <span className="text-xs font-medium truncate max-w-[70px]">{node.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 pb-8">
      <h2 className="font-bold text-2xl mb-2">Node Settings</h2>
      <div>
        <Label className="mb-1.5 block text-sm">Select a node to edit</Label>
        <NodeList />
      </div>
      {selectedNode ? (
        <div>
          <Tabs value={tab} onValueChange={setTab} className="w-full mt-3">
            <TabsList className="grid w-full grid-cols-3 mb-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <form className="flex flex-col gap-4 mt-2" onSubmit={onSave}>
                <div>
                  <Label htmlFor="node-label">Label</Label>
                  <Input
                    id="node-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Node label"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="node-color">Color</Label>
                  <Input
                    id="node-color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g., blue or #3483eb"
                  />
                </div>
                <Button type="submit" className="mt-2 w-fit">Save</Button>
              </form>
            </TabsContent>
            <TabsContent value="appearance">
              <form className="flex flex-col gap-5 mt-1" onSubmit={onSave}>
                <div>
                  <Label>Icon</Label>
                  <IconPicker
                    value={appearance.icon || selectedNode.type}
                    onChange={(icon) => setAppearance((prev) => ({ ...prev, icon }))}
                  />
                </div>
                <div>
                  <Label htmlFor="appearance-color">Node Color</Label>
                  <Input
                    id="appearance-color"
                    value={appearance.color || ""}
                    onChange={(e) =>
                      setAppearance((p) => ({ ...p, color: e.target.value }))
                    }
                    placeholder="e.g. #1a1a1a"
                  />
                </div>
                <div>
                  <Label htmlFor="appearance-size">
                    Node Size ({appearance.size ?? 64}px)
                  </Label>
                  <Slider
                    id="appearance-size"
                    min={40}
                    max={120}
                    step={2}
                    value={[appearance.size ?? 64]}
                    onValueChange={([size]) =>
                      setAppearance((p) => ({ ...p, size }))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="appearance-label-field">Label Field</Label>
                  <Input
                    id="appearance-label-field"
                    value={appearance.labelField || "label"}
                    onChange={(e) =>
                      setAppearance((p) => ({
                        ...p,
                        labelField: e.target.value,
                      }))
                    }
                    placeholder='e.g. "label", "name", "attribute"'
                  />
                </div>
                <Button type="submit" className="mt-2 w-fit">Save</Button>
              </form>
            </TabsContent>
            <TabsContent value="advanced">
              <div className="p-2 text-sm text-muted-foreground">
                Advanced settings coming soon.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="rounded-lg border bg-muted px-6 py-8 mt-6 text-center text-muted-foreground text-sm">
          Select a node from above to edit.
        </div>
      )}
    </div>
  );
}
