import type { DashboardIconKey } from "@/shared/components/dashboard/dashboard-icons";

export interface DashboardSidebarItem {
  key: string;
  label: string;
  href: string;
  icon: DashboardIconKey;
  disabled?: boolean;
  trailingIcon?: DashboardIconKey;
}

export interface DashboardUser {
  name: string;
  description: string;
  initials?: string;
}
