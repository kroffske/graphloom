
import React, { createContext, useContext, ReactNode } from "react";
import EntityIcon from "./NodeIcons/EntityIcon";
import ProcessIcon from "./NodeIcons/ProcessIcon";
import DataStoreIcon from "./NodeIcons/DataStoreIcon";
import EventIcon from "./NodeIcons/EventIcon";
import DecisionIcon from "./NodeIcons/DecisionIcon";
import ExternalSystemIcon from "./NodeIcons/ExternalSystemIcon";
import ApiIcon from "./NodeIcons/ApiIcon";
import ServiceIcon from "./NodeIcons/ServiceIcon";
import MicroserviceIcon from "./NodeIcons/MicroserviceIcon";
import WebhookIcon from "./NodeIcons/WebhookIcon";
import CacheIcon from "./NodeIcons/CacheIcon";
import QueueIcon from "./NodeIcons/QueueIcon";
import StreamIcon from "./NodeIcons/StreamIcon";
import WarehouseIcon from "./NodeIcons/WarehouseIcon";
import ServerIcon from "./NodeIcons/ServerIcon";
import LoadBalancerIcon from "./NodeIcons/LoadBalancerIcon";
import GatewayIcon from "./NodeIcons/GatewayIcon";
import FirewallIcon from "./NodeIcons/FirewallIcon";
import WorkflowIcon from "./NodeIcons/WorkflowIcon";
import RuleIcon from "./NodeIcons/RuleIcon";
import ConnectorIcon from "./NodeIcons/ConnectorIcon";
import MonitorIcon from "./NodeIcons/MonitorIcon";
import AlertIcon from "./NodeIcons/AlertIcon";
import SecurityIcon from "./NodeIcons/SecurityIcon";

import { icons } from "lucide-react";
import { ICON_GROUPS } from "@/config/iconConstants";

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
  // New Icons
  api: ApiIcon,
  service: ServiceIcon,
  microservice: MicroserviceIcon,
  webhook: WebhookIcon,
  cache: CacheIcon,
  queue: QueueIcon,
  stream: StreamIcon,
  warehouse: WarehouseIcon,
  server: ServerIcon,
  "load-balancer": LoadBalancerIcon,
  gateway: GatewayIcon,
  firewall: FirewallIcon,
  workflow: WorkflowIcon,
  rule: RuleIcon,
  connector: ConnectorIcon,
  monitor: MonitorIcon,
  alert: AlertIcon,
  security: SecurityIcon,
};

const lucideIconNames = ICON_GROUPS.Lucide;

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
