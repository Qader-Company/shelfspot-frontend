"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";

export function DashboardLocaleSwitcher({ label }: { label: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const nextLocale = locale === "ar" ? "en" : "ar";

  return (
    <Button asChild variant="ghost" className="h-10 gap-2 rounded-lg px-2 sm:px-3">
      <Link href={pathname} locale={nextLocale} aria-label={label}>
        <Languages className="size-5" />
        <span className="hidden text-sm font-semibold uppercase min-[390px]:inline">{nextLocale}</span>
      </Link>
    </Button>
  );
}
