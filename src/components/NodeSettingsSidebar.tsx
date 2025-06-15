
import React, { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGraphStore } from "@/state/useGraphStore";
import { toast } from "sonner";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

export function NodeSettingsSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { selectedNodeId, nodes, setNodes } = useGraphStore();
  const node = nodes.find(n => n.id === selectedNodeId);
  const [label, setLabel] = useState(node?.label || "");
  const [color, setColor] = useState(
    typeof node?.attributes.color === "string" ? node?.attributes.color : ""
  );
  const [tab, setTab] = useState("general");

  useEffect(() => {
    setLabel(node?.label || "");
    setColor(typeof node?.attributes.color === "string" ? node?.attributes.color : "");
  }, [node?.label, node?.attributes.color]);

  if (!open || !node) return null;

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newNodes = nodes.map(n =>
      n.id === node.id
        ? {
            ...n,
            label,
            attributes: { ...n.attributes, color },
          }
        : n
    );
    setNodes(newNodes);
    toast.success("Node settings saved");
    onClose();
  };

  return (
    <Sidebar
      side="right"
      className="md:block z-50 w-80 shadow-xl bg-background border-l"
      style={{ minWidth: 320, maxWidth: 420, right: 0, position: "fixed", top: 0, height: "100vh" }}
      data-testid="node-settings-sidebar"
    >
      <SidebarHeader>
        <div className="font-bold text-lg">Node Settings</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Edit Node</SidebarGroupLabel>
          <SidebarGroupContent>
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
                <form className="flex flex-col gap-4 mt-2" onSubmit={onSave}>
                  <div>
                    <Label htmlFor="node-label">Label</Label>
                    <Input
                      id="node-label"
                      value={label}
                      onChange={e => setLabel(e.target.value)}
                      placeholder="Node label"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="node-color">Color</Label>
                    <Input
                      id="node-color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      placeholder="e.g., blue or #3483eb"
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-2 bg-primary text-white rounded px-4 py-2 hover:bg-primary/80"
                  >
                    Save
                  </button>
                </form>
              </TabsContent>
              <TabsContent value="advanced">
                <div className="p-2 text-sm text-muted-foreground">
                  Advanced settings coming soon.
                </div>
              </TabsContent>
            </Tabs>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <button
          type="button"
          onClick={onClose}
          className="w-full text-center text-muted-foreground py-2 rounded hover:bg-muted"
        >
          Close
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
