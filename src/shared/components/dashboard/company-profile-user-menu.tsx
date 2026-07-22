"use client";

import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { useCompanyProfile } from "@/modules/company/profile/use-profile";
import { Button } from "@/shared/ui/button";

import type { DashboardUser } from "./types";

export function CompanyProfileUserMenu({ fallbackUser, label }: { fallbackUser: DashboardUser; label: string }) {
  const profileQuery = useCompanyProfile();
  const name = profileQuery.data?.name ?? fallbackUser.name;
  const description = profileQuery.data?.email ?? fallbackUser.description;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CP";

  return (
    <Button asChild aria-label={label} className="h-auto min-w-0 gap-3 rounded-full px-2 py-1 text-start hover:bg-muted" variant="ghost">
      <Link href={ROUTES.dashboardProfile}>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--dashboard-avatar-background)] text-xs font-bold text-[var(--dashboard-avatar-foreground)]">
          {initials}
        </span>
        <span className="hidden min-w-0 flex-col md:flex">
          <span className="max-w-40 truncate text-sm font-semibold leading-5 text-foreground">{name}</span>
          <span className="max-w-40 truncate text-xs leading-4 text-muted-foreground">{description}</span>
        </span>
      </Link>
    </Button>
  );
}
