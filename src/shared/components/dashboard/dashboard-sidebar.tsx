import { Logo } from "@/shared/ui/logo";

import { SidebarItem } from "./sidebar-item";
import type { DashboardSidebarItem } from "./types";

interface DashboardSidebarProps {
  items: DashboardSidebarItem[];
  navigationLabel: string;
  activeItemKey?: string;
}

export function DashboardSidebar({
  items,
  navigationLabel,
  activeItemKey,
}: DashboardSidebarProps) {
  const primaryItems = items.slice(0, 4);
  const secondaryItems = items.slice(4);

  return (
    <aside className="hidden min-h-dvh w-60 shrink-0 border-e border-border bg-card lg:flex lg:flex-col">
      <div className="flex h-24 items-center px-12">
        <Logo className="h-auto w-36" width={292} height={108} />
      </div>
      <nav className="flex flex-1 flex-col" aria-label={navigationLabel}>
        <div className="space-y-3 px-2">
          {primaryItems.map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              isActive={item.key === activeItemKey}
            />
          ))}
        </div>
        <div className="mt-8 border-t border-border px-2 pt-4">
          <div className="space-y-3">
            {secondaryItems.map((item) => (
              <SidebarItem
                key={item.key}
                item={item}
                isActive={item.key === activeItemKey}
              />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
