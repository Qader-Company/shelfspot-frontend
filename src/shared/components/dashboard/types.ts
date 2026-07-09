import type { ComponentType } from "react";

export interface DashboardSidebarItem {
  key: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  disabled?: boolean;
  trailingIcon?: ComponentType<{ className?: string }>;
}

export interface DashboardUser {
  name: string;
  description: string;
  initials?: string;
}
