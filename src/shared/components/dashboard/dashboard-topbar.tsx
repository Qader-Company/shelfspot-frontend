"use client";

import { Menu } from "lucide-react";

import { Button } from "@/shared/ui/button";

import { NotificationButtonWrapper } from "@/shared/components/notifications/notification-button-wrapper";
import { DashboardLocaleSwitcher } from "./dashboard-locale-switcher";
import { SearchInput } from "./search-input";
import { UserMenu } from "./user-menu";
import type { DashboardSidebarItem, DashboardUser } from "./types";
import { useUiStore } from "@/shared/stores/ui-store";
import type { AuthContext } from "@/modules/auth/config/auth-context";

interface DashboardTopbarProps {
  authContext: AuthContext;
  searchItems: DashboardSidebarItem[];
  searchLabel: string;
  searchPlaceholder: string;
  searchNoResults: string;
  menuLabel: string;
  notificationLabel: string;
  userMenuLabel: string;
  languageLabel: string;
  user: DashboardUser;
}

export function DashboardTopbar({
  authContext,
  searchItems,
  searchLabel,
  searchPlaceholder,
  searchNoResults,
  menuLabel,
  notificationLabel,
  userMenuLabel,
  languageLabel,
  user,
}: DashboardTopbarProps) {
  const openSidebar = useUiStore((state) => state.openSidebar);
  return (
    <header className="sticky top-0 z-30 grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 border-b border-border bg-card px-3 py-2 sm:h-16 sm:gap-x-4 sm:px-4 sm:py-0 lg:px-8">
      <Button
        aria-label={menuLabel}
        className="col-start-1 row-start-1 size-10 rounded-lg lg:hidden"
        type="button"
        variant="ghost"
        size="icon"
        onClick={openSidebar}
      >
        <Menu className="size-5" />
      </Button>

      <div className="col-span-3 row-start-2 min-w-0 sm:col-span-1 sm:col-start-2 sm:row-start-1">
        <SearchInput
          items={searchItems}
          label={searchLabel}
          placeholder={searchPlaceholder}
          noResultsLabel={searchNoResults}
          className="max-w-none sm:max-w-[420px]"
        />
      </div>

      <div className="col-start-3 row-start-1 flex min-w-0 shrink-0 items-center justify-end gap-1 sm:gap-2 lg:gap-4">
        <DashboardLocaleSwitcher label={languageLabel} />
        <UserMenu authContext={authContext} user={user} label={userMenuLabel} />
        <NotificationButtonWrapper 
          label={notificationLabel}
          portal={authContext === "admin" ? "admin" : "company"}
        />
      </div>
    </header>
  );
}
