import type { DashboardIconKey } from "@/shared/components/dashboard/dashboard-icons";

export interface DashboardSidebarChild {
  key: string;
  label: string;
  href: string;
}

export interface DashboardSidebarItem {
  key: string;
  label: string;
  href: string;
  icon: DashboardIconKey;
  disabled?: boolean;
  trailingIcon?: DashboardIconKey;
  /** Optional sub-navigation items; parent becomes expandable. */
  children?: DashboardSidebarChild[];
}

export interface DashboardUser {
  name: string;
  description: string;
  initials?: string;
}
