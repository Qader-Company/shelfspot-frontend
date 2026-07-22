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
  CompaniesIcon,
  WorkersIcon,
  PromoCodeIcon,
  SettingsIcon,
  ServicesIcon,
  type DashboardIconKey,
} from "@/shared/components/dashboard/dashboard-icons";
import { cn } from "@/shared/lib/utils";

import type { DashboardSidebarItem } from "./types";

interface SidebarItemProps {
  item: DashboardSidebarItem;
  isActive?: boolean;
  isExpanded?: boolean;
  isPending?: boolean;
  onAction?: () => void;
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
  companies: CompaniesIcon,
  workers: WorkersIcon,
  promoCode: PromoCodeIcon,
  settings: SettingsIcon,
  services: ServicesIcon,
} satisfies Record<DashboardIconKey, ComponentType<{ className?: string }>>;

export function SidebarItem({
  item,
  isActive = false,
  isExpanded = false,
  isPending = false,
  onAction,
}: SidebarItemProps) {
  const Icon = iconComponents[item.icon];
  const TrailingIcon = item.trailingIcon
    ? iconComponents[item.trailingIcon]
    : SidebarChevronIcon;

  const className = cn(
    "flex h-14 w-full items-center gap-3 rounded-lg px-5 text-start text-sm font-medium transition-colors",
    "text-muted-foreground hover:bg-muted hover:text-foreground",
    isActive && "bg-primary text-white hover:bg-primary hover:text-white",
    (item.disabled || isPending) && "pointer-events-none opacity-60",
  );
  const content = (
    <>
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
    </>
  );

  if (onAction) {
    return (
      <button
        type="button"
        className={className}
        disabled={item.disabled || isPending}
        aria-busy={isPending}
        onClick={onAction}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={className}
    >
      {content}
    </Link>
  );
}
