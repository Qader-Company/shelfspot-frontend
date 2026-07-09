import { ChevronDown } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";

import type { DashboardSidebarItem } from "./types";

interface SidebarItemProps {
  item: DashboardSidebarItem;
  isActive?: boolean;
}

export function SidebarItem({ item, isActive = false }: SidebarItemProps) {
  const Icon = item.icon;
  const TrailingIcon = item.trailingIcon ?? ChevronDown;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-14 items-center gap-3 rounded-lg px-5 text-sm font-medium transition-colors",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        item.disabled && "pointer-events-none opacity-60",
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.trailingIcon ? <TrailingIcon className="size-4 shrink-0" /> : null}
    </Link>
  );
}
