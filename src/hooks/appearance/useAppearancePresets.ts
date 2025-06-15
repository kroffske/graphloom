
import { useMemo, useEffect, useState } from "react";
import { appearancePresets } from "@/data/appearancePresets";
import { Preset, PresetConfig } from "@/types/appearance";

const CUSTOM_PRESET_KEY = "custom";

function getPersistedCustomPreset(): Preset | null {
  try {
    const str = localStorage.getItem("lovable_custom_preset");
    if (!str) return null;
    const config = JSON.parse(str);
    return { name: "Custom", key: CUSTOM_PRESET_KEY, config };
  } catch {
    return null;
  }
}

export function persistCustomPreset(config: PresetConfig) {
  try {
    localStorage.setItem("lovable_custom_preset", JSON.stringify(config));
  } catch {}
}

const SELECTED_PRESET_LOCAL_KEY = "lovable_selected_preset_key";

function getPersistedSelectedPresetKey(): string | null {
  try {
    return localStorage.getItem(SELECTED_PRESET_LOCAL_KEY);
  } catch {
    return null;
  }
}

export function persistSelectedPresetKey(selectedKey: string) {
  try {
    localStorage.setItem(SELECTED_PRESET_LOCAL_KEY, selectedKey);
  } catch {}
}

export function useAppearancePresets() {
  const [customPreset, setCustomPreset] = useState(() =>
    getPersistedCustomPreset()
  );
  const [selectedPresetKey, setSelectedPresetKey] = useState<
    string | undefined
  >(undefined);

  const displayedPresets = useMemo(() => {
    const presets = [...appearancePresets];
    if (customPreset) return [customPreset, ...presets];
    return presets;
  }, [customPreset]);

  useEffect(() => {
    if (selectedPresetKey === undefined) {
      const persistedKey = getPersistedSelectedPresetKey();
      const hasPersisted =
        persistedKey && displayedPresets.find((p) => p.key === persistedKey);
      if (hasPersisted) setSelectedPresetKey(persistedKey);
      else if (displayedPresets.length > 0) {
        setSelectedPresetKey(displayedPresets[0].key);
        persistSelectedPresetKey(displayedPresets[0].key);
      }
    } else {
      const found = displayedPresets.find((p) => p.key === selectedPresetKey);
      if (!found && displayedPresets.length > 0) {
        setSelectedPresetKey(displayedPresets[0].key);
        persistSelectedPresetKey(displayedPresets[0].key);
      }
    }
    // eslint-disable-next-line
  }, [displayedPresets]);

  useEffect(() => {
    if (
      selectedPresetKey &&
      displayedPresets.some((p) => p.key === selectedPresetKey)
    ) {
      persistSelectedPresetKey(selectedPresetKey);
    }
  }, [selectedPresetKey, displayedPresets]);

  const selectedPresetObj = useMemo(() => {
    if (!selectedPresetKey) return null;
    return displayedPresets.find((p) => p.key === selectedPresetKey) || null;
  }, [selectedPresetKey, displayedPresets]);

  useEffect(() => {
    const loaded = getPersistedCustomPreset();
    if (loaded) setCustomPreset(loaded);
  }, []);

  return {
    customPreset,
    setCustomPreset,
    displayedPresets,
    selectedPresetKey,
    setSelectedPresetKey,
    selectedPresetObj,
  };
}
