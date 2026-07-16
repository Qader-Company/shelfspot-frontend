"use client";

import { Menu } from "lucide-react";

import { Button } from "@/shared/ui/button";

import { NotificationButton } from "./notification-button";
import { SearchInput } from "./search-input";
import { UserMenu } from "./user-menu";
import type { DashboardUser } from "./types";
import { useUiStore } from "@/shared/stores/ui-store";

interface DashboardTopbarProps {
  searchLabel: string;
  searchPlaceholder: string;
  menuLabel: string;
  notificationLabel: string;
  userMenuLabel: string;
  user: DashboardUser;
}

export function DashboardTopbar({
  searchLabel,
  searchPlaceholder,
  menuLabel,
  notificationLabel,
  userMenuLabel,
  user,
}: DashboardTopbarProps) {
  const openSidebar = useUiStore((state) => state.openSidebar);
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-4">
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
        <SearchInput
          label={searchLabel}
          placeholder={searchPlaceholder}
          className="max-w-[420px]"
        />
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <UserMenu user={user} label={userMenuLabel} />
        <NotificationButton label={notificationLabel} />
      </div>
    </header>
  );
}
