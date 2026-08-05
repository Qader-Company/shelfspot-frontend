"use client";

import { ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";

interface PublicLocaleSwitcherProps {
  label: string;
}

export function PublicLocaleSwitcher({ label }: PublicLocaleSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const nextLocale = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={pathname}
      locale={nextLocale}
      aria-label={label}
      className="relative z-20 inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-sm font-medium text-foreground transition-colors hover:text-primary sm:gap-1.5 sm:text-lg lg:text-[20px]"
    >
      <ChevronDown className="hidden size-3.5 sm:block sm:size-4" />
      <span>{label}</span>
    </Link>
  );
}
