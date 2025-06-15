
import React, { createContext, useContext, ReactNode } from "react";
import EntityIcon from "./NodeIcons/EntityIcon";
import ProcessIcon from "./NodeIcons/ProcessIcon";
import DataStoreIcon from "./NodeIcons/DataStoreIcon";
import EventIcon from "./NodeIcons/EventIcon";
import DecisionIcon from "./NodeIcons/DecisionIcon";
import ExternalSystemIcon from "./NodeIcons/ExternalSystemIcon";

export type NodeType =
  | "entity"
  | "process"
  | "data-store"
  | "event"
  | "decision"
  | "external-system";

export interface IconRegistryType {
  [nodeType: string]: React.ComponentType<{
    filled?: boolean;
    className?: string;
    'aria-label'?: string;
    color?: string; // <-- Allow passing the color prop
  }>;
}

const ICON_REGISTRY: IconRegistryType = {
  entity: EntityIcon,
  process: ProcessIcon,
  "data-store": DataStoreIcon,
  event: EventIcon,
  decision: DecisionIcon,
  "external-system": ExternalSystemIcon,
};

const IconRegistryContext = createContext<IconRegistryType>(ICON_REGISTRY);

export const useIconRegistry = () => useContext(IconRegistryContext);

export const IconRegistryProvider = ({ children }: { children: ReactNode }) => (
  <IconRegistryContext.Provider value={ICON_REGISTRY}>
    {children}
  </IconRegistryContext.Provider>
);

