
import React, { createContext, useContext, ReactNode } from "react";
import EntityIcon from "./NodeIcons/EntityIcon";
import ProcessIcon from "./NodeIcons/ProcessIcon";
import DataStoreIcon from "./NodeIcons/DataStoreIcon";
import EventIcon from "./NodeIcons/EventIcon";
import DecisionIcon from "./NodeIcons/DecisionIcon";
import ExternalSystemIcon from "./NodeIcons/ExternalSystemIcon";
import { User, AlertCircle, Activity } from "lucide-react"; // Demo icon list!

export type NodeType =
  | "entity"
  | "process"
  | "data-store"
  | "event"
  | "decision"
  | "external-system"
  | "user"
  | "alert-circle"
  | "activity";

export interface IconRegistryType {
  [nodeType: string]: React.ComponentType<{
    filled?: boolean;
    className?: string;
    'aria-label'?: string;
    color?: string;
  }>;
}

// Lucide wrappers for consistency
const UserIcon: React.FC<{ filled?: boolean; className?: string; color?: string }> = ({
  className = "",
  color,
  ...props
}) => (
  <User className={className} color={color || "currentColor"} fill={props.filled ? (color || "currentColor") : "none"} />
);

const AlertCircleIcon: React.FC<{ filled?: boolean; className?: string; color?: string }> = ({
  className = "",
  color,
  ...props
}) => (
  <AlertCircle className={className} color={color || "currentColor"} fill={props.filled ? (color || "currentColor") : "none"} />
);

const ActivityIcon: React.FC<{ filled?: boolean; className?: string; color?: string }> = ({
  className = "",
  color,
  ...props
}) => (
  <Activity className={className} color={color || "currentColor"} fill={props.filled ? (color || "currentColor") : "none"} />
);

const ICON_REGISTRY: IconRegistryType = {
  entity: EntityIcon,
  process: ProcessIcon,
  "data-store": DataStoreIcon,
  event: EventIcon,
  decision: DecisionIcon,
  "external-system": ExternalSystemIcon,
  user: UserIcon,
  "alert-circle": AlertCircleIcon,
  activity: ActivityIcon,
};

const IconRegistryContext = createContext<IconRegistryType>(ICON_REGISTRY);

export const useIconRegistry = () => useContext(IconRegistryContext);

export const IconRegistryProvider = ({ children }: { children: ReactNode }) => (
  <IconRegistryContext.Provider value={ICON_REGISTRY}>
    {children}
  </IconRegistryContext.Provider>
);

// --- Demo dropdown to preview Lucide icons ---
import LucideIconDropdown from "./LucideIconDropdown";
export { LucideIconDropdown };
