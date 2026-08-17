"use client";

import type { ReactNode } from "react";

import type { AuthContext } from "@/modules/auth/config/auth-context";
import { NotificationDebug } from "@/shared/components/notifications/notification-debug";

import { DashboardBodyLock } from "./dashboard-body-lock";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import type { DashboardSidebarItem, DashboardUser } from "./types";

interface DashboardLayoutProps {
  authContext: AuthContext;
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
    language: string;
  };
  primaryItemCount?: number;
}

export function DashboardLayout({
  authContext,
  children,
  sidebarItems,
  user,
  labels,
  primaryItemCount,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <DashboardBodyLock />
      <DashboardSidebar
        authContext={authContext}
        items={sidebarItems}
        navigationLabel={labels.navigation}
        logoLabel={labels.logo}
        primaryItemCount={primaryItemCount}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <DashboardTopbar
          authContext={authContext}
          searchItems={sidebarItems}
          searchLabel={labels.search}
          searchPlaceholder={labels.searchPlaceholder}
          searchNoResults={labels.searchNoResults}
          menuLabel={labels.menu}
          notificationLabel={labels.notification}
          userMenuLabel={labels.userMenu}
          languageLabel={labels.language}
          user={user}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      {process.env.NODE_ENV === "development" ? (
        <NotificationDebug
          portal={authContext === "admin" ? "admin" : "company"}
        />
      ) : null}
    </div>
  );
}
