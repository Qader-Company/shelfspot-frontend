"use client";

import type { ComponentType } from "react";

import { Link } from "@/i18n/navigation";
import {
  AdminsIcon,
  BoxIcon,
  CatalogIcon,
  DashboardGridIcon,
  LogoutIcon,
  PaymentIcon,
  SidebarChevronIcon,
  TrashIcon,
  type DashboardIconKey,
} from "@/shared/components/dashboard/dashboard-icons";
import { cn } from "@/shared/lib/utils";

import type { DashboardSidebarItem } from "./types";

interface SidebarItemProps {
  item: DashboardSidebarItem;
  isActive?: boolean;
  isExpanded?: boolean;
}

const iconComponents = {
  dashboard: DashboardGridIcon,
  box: BoxIcon,
  payment: PaymentIcon,
  catalog: CatalogIcon,
  admins: AdminsIcon,
  trash: TrashIcon,
  logout: LogoutIcon,
  chevron: SidebarChevronIcon,
} satisfies Record<DashboardIconKey, ComponentType<{ className?: string }>>;

export function SidebarItem({
  item,
  isActive = false,
  isExpanded = false,
}: SidebarItemProps) {
  const Icon = iconComponents[item.icon];
  const TrailingIcon = item.trailingIcon
    ? iconComponents[item.trailingIcon]
    : SidebarChevronIcon;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-14 items-center gap-3 rounded-lg px-5 text-sm font-medium transition-colors",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        isActive && "bg-primary text-white hover:bg-primary hover:text-white",
        item.disabled && "pointer-events-none opacity-60",
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.trailingIcon ? (
        <TrailingIcon
          className={cn(
            "size-4 shrink-0 transition-transform duration-200",
            isExpanded && "rotate-180",
          )}
        />
      ) : null}
    </Link>
  );
}
