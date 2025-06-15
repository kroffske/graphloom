import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

type Props = {
  editableJson: string;
  setEditableJson: (val: string) => void;
  isDirty: boolean;
  setIsDirty: (v: boolean) => void;
  completePresetObject: Record<string, any>;
  onSaveCustomPresetFromJson: (jsonStr: string) => boolean;
};

export default function PresetJsonConfigTextarea({
  editableJson,
  setEditableJson,
  isDirty,
  setIsDirty,
  completePresetObject,
  onSaveCustomPresetFromJson,
}: Props) {
  useEffect(() => {
    if (!isDirty) {
      setEditableJson(JSON.stringify(completePresetObject, null, 2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completePresetObject, isDirty]);

  function handleCopyPreset() {
    try {
      navigator.clipboard.writeText(editableJson);
      toast.success("Appearance preset JSON copied!");
    } catch {
      toast.error("Unable to copy JSON!");
    }
  }

  function handleJsonChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setEditableJson(e.target.value);
    setIsDirty(true);
  }
  function handleSavePreset() {
    onSaveCustomPresetFromJson(editableJson);
  }

  return (
    <div className="flex flex-col mt-4">
      <div className="mb-2">
        <span className="font-semibold text-base">Preset JSON Config</span>
      </div>
      <Textarea
        value={editableJson}
        onChange={handleJsonChange}
        className="bg-muted resize-none font-mono text-xs min-h-[300px] max-h-[600px] h-full"
        style={{ minWidth: "170px" }}
        spellCheck={false}
      />
      <div className="flex items-center justify-end gap-2 mt-2">
        <Button variant="outline" size="sm" onClick={handleCopyPreset} type="button">
          Copy
        </Button>
        <Button variant="outline" size="sm" onClick={handleSavePreset} type="button">
          <Save className="w-4 h-4 mr-1" /> Save
        </Button>
      </div>
    </div>
  );
}
