"use client";

import { ROUTES } from "@/config/routes";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";
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

  // Resolve active top-level key (also matches parent when on a child path)
  const resolvedActiveItemKey =
    activeItemKey ??
    items
      .filter((item) => item.href !== ROUTES.home)
      .sort((first, second) => second.href.length - first.href.length)
      .find(
        (item) =>
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`) ||
          item.children?.some(
            (c) => pathname === c.href || pathname.startsWith(`${c.href}/`),
          ),
      )
      ?.key ??
    "home";

  // Render a list of sidebar items, handling expandable parents
  function renderItems(list: DashboardSidebarItem[]) {
    return list.map((item) => {
      const isParentActive = item.key === resolvedActiveItemKey;
      const isExpanded =
        item.children != null &&
        item.children.some(
          (c) => pathname === c.href || pathname.startsWith(`${c.href}/`),
        );

      return (
        <div key={item.key}>
          <SidebarItem item={item} isActive={isParentActive && !item.children} isExpanded={isExpanded} />
          {/* Render children when this parent is expanded */}
          {item.children && isExpanded && (
            <div className="mt-1 space-y-0.5 ps-7">
              {item.children.map((child) => {
                const isChildActive =
                  pathname === child.href ||
                  pathname.startsWith(`${child.href}/`);
                return (
                  <Link
                    key={child.key}
                    href={child.href}
                    aria-current={isChildActive ? "page" : undefined}
                    className={cn(
                      "flex h-9 items-center rounded-lg px-4 text-sm font-medium transition-colors",
                      isChildActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <aside className="hidden h-full w-60 shrink-0 border-e border-border bg-card lg:flex lg:flex-col">
      <div className="flex h-24 items-center px-12">
        <Link href={ROUTES.home} aria-label={logoLabel} className="block">
          <Logo className="h-auto w-36" width={292} height={108} />
        </Link>
      </div>
      <nav className="flex flex-1 flex-col" aria-label={navigationLabel}>
        <div className="space-y-3 px-2">{renderItems(primaryItems)}</div>
        <div className="mt-8 border-t border-border px-2 pt-4">
          <div className="space-y-3">{renderItems(secondaryItems)}</div>
        </div>
      </nav>
    </aside>
  );
}
