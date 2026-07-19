import type { ReactNode } from "react";

import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import type { DashboardSidebarItem, DashboardUser } from "./types";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: DashboardSidebarItem[];
  user: DashboardUser;
  labels: {
    navigation: string;
    logo: string;
    search: string;
    searchPlaceholder: string;
    searchNoResults: string;
    menu: string;
    notification: string;
    userMenu: string;
  };
  primaryItemCount?: number;
}

export function DashboardLayout({
  children,
  sidebarItems,
  user,
  labels,
  primaryItemCount,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <DashboardSidebar
        items={sidebarItems}
        navigationLabel={labels.navigation}
        logoLabel={labels.logo}
        primaryItemCount={primaryItemCount}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <DashboardTopbar
          searchItems={sidebarItems}
          searchLabel={labels.search}
          searchPlaceholder={labels.searchPlaceholder}
          searchNoResults={labels.searchNoResults}
          menuLabel={labels.menu}
          notificationLabel={labels.notification}
          userMenuLabel={labels.userMenu}
          user={user}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
