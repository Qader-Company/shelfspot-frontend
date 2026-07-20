"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useLocale } from "next-intl";
import { ROUTES } from "@/config/routes";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";
import { Logo } from "@/shared/ui/logo";
import { Button } from "@/shared/ui/button";
import { useUiStore } from "@/shared/stores/ui-store";

import { SidebarItem } from "./sidebar-item";
import type { DashboardSidebarItem } from "./types";

interface DashboardSidebarProps {
  items: DashboardSidebarItem[];
  navigationLabel: string;
  logoLabel: string;
  activeItemKey?: string;
  primaryItemCount?: number;
}

export function DashboardSidebar({
  items,
  navigationLabel,
  logoLabel,
  activeItemKey,
  primaryItemCount = 4,
}: DashboardSidebarProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const primaryItems = items.slice(0, primaryItemCount);
  const secondaryItems = items.slice(primaryItemCount);

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeSidebar, isSidebarOpen]);

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
    <>
      <button
        type="button"
        aria-label={navigationLabel}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 transition-opacity lg:hidden",
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeSidebar}
      />
    <aside className={cn(
      "fixed inset-y-0 start-0 z-50 flex h-dvh w-[min(18rem,86vw)] shrink-0 flex-col border-e border-border bg-card shadow-xl transition-transform duration-200 lg:static lg:h-full lg:w-60 lg:translate-x-0 lg:shadow-none",
      isSidebarOpen
        ? "translate-x-0"
        : locale === "ar"
          ? "translate-x-full"
          : "-translate-x-full",
    )}>
      <div className="flex h-20 items-center justify-between px-6 lg:h-24 lg:px-12">
        <Link href={ROUTES.home} aria-label={logoLabel} className="block">
          <Logo className="h-auto w-36" width={292} height={108} />
        </Link>
        <Button type="button" variant="ghost" size="icon-sm" className="lg:hidden" onClick={closeSidebar} aria-label={navigationLabel}>
          <X className="size-5" />
        </Button>
      </div>
      <nav className="flex flex-1 flex-col" aria-label={navigationLabel}>
        <div className="space-y-3 px-2">{renderItems(primaryItems)}</div>
        <div className="mt-8 border-t border-border px-2 pt-4">
          <div className="space-y-3">{renderItems(secondaryItems)}</div>
        </div>
      </nav>
    </aside>
    </>
  );
}
