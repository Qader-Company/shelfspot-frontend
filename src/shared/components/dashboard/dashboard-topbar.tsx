"use client";

import { Menu } from "lucide-react";

import { Button } from "@/shared/ui/button";

import { NotificationButton } from "./notification-button";
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
    <header className="sticky top-0 z-10 grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 border-b border-border bg-card px-3 py-2 sm:flex sm:h-16 sm:gap-4 sm:px-4 sm:py-0 lg:px-8">
      <div className="contents sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:gap-4">
        <Button
          aria-label={menuLabel}
          className="size-10 rounded-lg lg:hidden"
          type="button"
          variant="ghost"
          size="icon"
          onClick={openSidebar}
        >
          <Menu className="size-5" />
        </Button>
        <div className="col-span-2 row-start-2 min-w-0 sm:contents">
          <SearchInput
            items={searchItems}
            label={searchLabel}
            placeholder={searchPlaceholder}
            noResultsLabel={searchNoResults}
            className="max-w-[420px]"
          />
        </div>
      </div>
      <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-end gap-1 sm:gap-2 lg:gap-4">
        <DashboardLocaleSwitcher label={languageLabel} />
        <UserMenu authContext={authContext} user={user} label={userMenuLabel} />
        <NotificationButton label={notificationLabel} />
      </div>
    </header>
  );
}
