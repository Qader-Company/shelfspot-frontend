import type { ReactNode } from "react";

import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import type { DashboardSidebarItem, DashboardUser } from "./types";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: DashboardSidebarItem[];
  activeSidebarItemKey?: string;
  user: DashboardUser;
  labels: {
    navigation: string;
    logo: string;
    search: string;
    searchPlaceholder: string;
    menu: string;
    notification: string;
    userMenu: string;
  };
}

export function DashboardLayout({
  children,
  sidebarItems,
  activeSidebarItemKey,
  user,
  labels,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-dvh bg-background">
      <DashboardSidebar
        items={sidebarItems}
        navigationLabel={labels.navigation}
        logoLabel={labels.logo}
        activeItemKey={activeSidebarItemKey}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          searchLabel={labels.search}
          searchPlaceholder={labels.searchPlaceholder}
          menuLabel={labels.menu}
          notificationLabel={labels.notification}
          userMenuLabel={labels.userMenu}
          user={user}
        />
        <main className="min-h-[calc(100dvh-4rem)] flex-1">{children}</main>
      </div>
    </div>
  );
}
