"use client";

import { ROUTES } from "@/config/routes";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/shared/ui/logo";

import { SidebarItem } from "./sidebar-item";
import type { DashboardSidebarItem } from "./types";

interface DashboardSidebarProps {
  items: DashboardSidebarItem[];
  navigationLabel: string;
  logoLabel: string;
  activeItemKey?: string;
}

export function DashboardSidebar({
  items,
  navigationLabel,
  logoLabel,
  activeItemKey,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const primaryItems = items.slice(0, 4);
  const secondaryItems = items.slice(4);
  const resolvedActiveItemKey =
    activeItemKey ??
    items
      .filter((item) => item.href !== ROUTES.home)
      .sort((first, second) => second.href.length - first.href.length)
      .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
      ?.key ??
    "home";

  return (
    <aside className="hidden min-h-dvh w-60 shrink-0 border-e border-border bg-card lg:flex lg:flex-col">
      <div className="flex h-24 items-center px-12">
        <Link href={ROUTES.home} aria-label={logoLabel} className="block">
          <Logo className="h-auto w-36" width={292} height={108} />
        </Link>
      </div>
      <nav className="flex flex-1 flex-col" aria-label={navigationLabel}>
        <div className="space-y-3 px-2">
          {primaryItems.map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              isActive={item.key === resolvedActiveItemKey}
            />
          ))}
        </div>
        <div className="mt-8 border-t border-border px-2 pt-4">
          <div className="space-y-3">
            {secondaryItems.map((item) => (
              <SidebarItem
                key={item.key}
                item={item}
                isActive={item.key === resolvedActiveItemKey}
              />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
