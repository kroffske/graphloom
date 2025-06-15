
import React, { createContext, useContext, ReactNode } from "react";
import EntityIcon from "./NodeIcons/EntityIcon";
import ProcessIcon from "./NodeIcons/ProcessIcon";
import DataStoreIcon from "./NodeIcons/DataStoreIcon";
import EventIcon from "./NodeIcons/EventIcon";
import DecisionIcon from "./NodeIcons/DecisionIcon";
import ExternalSystemIcon from "./NodeIcons/ExternalSystemIcon";
import { User, Pc } from "lucide-react";

export type NodeType =
  | "entity"
  | "process"
  | "data-store"
  | "event"
  | "decision"
  | "external-system"
  | "user"
  | "pc";

export interface IconRegistryType {
  [nodeType: string]: React.ComponentType<{
    filled?: boolean;
    className?: string;
    'aria-label'?: string;
    color?: string;
  }>;
}

// Lucide wrappers for consistency with color prop etc.
const UserIcon: React.FC<{ filled?: boolean; className?: string; color?: string; }> = ({
  className = "",
  color,
  ...props
}) => (
  <User className={className} color={color || "currentColor"} fill={props.filled ? (color || "currentColor") : "none"} />
);

const PcIcon: React.FC<{ filled?: boolean; className?: string; color?: string; }> = ({
  className = "",
  color,
  ...props
}) => (
  <Pc className={className} color={color || "currentColor"} fill={props.filled ? (color || "currentColor") : "none"} />
);

const ICON_REGISTRY: IconRegistryType = {
  entity: EntityIcon,
  process: ProcessIcon,
  "data-store": DataStoreIcon,
  event: EventIcon,
  decision: DecisionIcon,
  "external-system": ExternalSystemIcon,
  user: UserIcon,
  pc: PcIcon,
};

const IconRegistryContext = createContext<IconRegistryType>(ICON_REGISTRY);

export const useIconRegistry = () => useContext(IconRegistryContext);

export const IconRegistryProvider = ({ children }: { children: ReactNode }) => (
  <IconRegistryContext.Provider value={ICON_REGISTRY}>
    {children}
  </IconRegistryContext.Provider>
);

