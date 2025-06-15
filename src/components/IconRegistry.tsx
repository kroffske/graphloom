
import React, { createContext, useContext, ReactNode } from "react";
import EntityIcon from "./NodeIcons/EntityIcon";
import ProcessIcon from "./NodeIcons/ProcessIcon";
import DataStoreIcon from "./NodeIcons/DataStoreIcon";
import EventIcon from "./NodeIcons/EventIcon";
import DecisionIcon from "./NodeIcons/DecisionIcon";
import ExternalSystemIcon from "./NodeIcons/ExternalSystemIcon";
import { icons } from "lucide-react";

export type IconRegistryType = {
  [nodeType: string]: React.ComponentType<{
    filled?: boolean;
    className?: string;
    'aria-label'?: string;
    color?: string;
    width?: string | number;
    height?: string | number;
  }>;
};

const classicIcons: IconRegistryType = {
  entity: EntityIcon,
  process: ProcessIcon,
  "data-store": DataStoreIcon,
  event: EventIcon,
  decision: DecisionIcon,
  "external-system": ExternalSystemIcon,
};

const lucideIconNames = [
    "user", "activity", "alert-circle", "airplay", "air-vent", "alarm-clock", "align-center", "align-justify", "anchor",
    "award", "baby", "battery", "bell", "book", "bookmark", "briefcase", "building", "calendar", "camera", "car", "check", "chevron-down",
    "circle", "cloud", "code", "coffee", "compass", "computer", "cpu", "database", "dice", "disc", "dollar-sign", "download", "edit", "eye",
    "file", "flag", "folder", "gift", "globe", "grid", "heart", "home", "image", "key", "layers", "layout", "lightbulb", "link", "list", "lock",
    "map", "menu", "message-square", "mic", "moon", "music", "paperclip", "phone", "pie-chart", "play", "plus", "printer", "refresh-cw", "save",
    "scissors", "search", "settings", "share", "shield", "shopping-cart", "shuffle", "sliders", "star", "sun", "tag", "thumbs-up", "trash", "trending-up",
    "tv", "umbrella", "unlock", "upload", "user-check", "users", "video", "watch", "wifi", "zap"
];

const lucideIcons: IconRegistryType = {};
lucideIconNames.forEach(name => {
    const camelCaseName = name.replace(/-([a-z])/g, g => g[1].toUpperCase());
    const LucideIconComponent = icons[camelCaseName as keyof typeof icons];
    if (LucideIconComponent) {
        const IconComponent: React.FC<{ filled?: boolean; className?: string; color?: string; width?: string | number; height?: string | number; }> = ({ className = "", color, ...props }) => (
            <LucideIconComponent className={className} color={color || "currentColor"} fill={props.filled ? (color || "currentColor") : "none"} {...props}/>
        );
        IconComponent.displayName = `Lucide(${name})`;
        lucideIcons[name] = IconComponent;
    }
});

const ICON_REGISTRY: IconRegistryType = { ...classicIcons, ...lucideIcons };

const IconRegistryContext = createContext<IconRegistryType>(ICON_REGISTRY);

export const useIconRegistry = () => useContext(IconRegistryContext);

export const IconRegistryProvider = ({ children }: { children: ReactNode }) => (
  <IconRegistryContext.Provider value={ICON_REGISTRY}>
    {children}
  </IconRegistryContext.Provider>
);
