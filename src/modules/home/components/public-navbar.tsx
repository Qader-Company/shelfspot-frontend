import { ChevronDown } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import type { Locale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { LandingContainer } from "@/modules/home/components/landing-container";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/logo";

interface PublicNavbarProps {
  locale: Locale;
}

export async function PublicNavbar({ locale }: PublicNavbarProps) {
  const t = await getTranslations("home.navbar");
  const isRtl = locale === "ar";
  const nextLocale = locale === "ar" ? "en" : "ar";
  const navLinks = [
    { href: `${ROUTES.home}#about`, label: t("links.about") },
    { href: `${ROUTES.home}#features`, label: t("links.features") },
    { href: `${ROUTES.home}#how-it-works`, label: t("links.howItWorks") },
    { href: `${ROUTES.home}#contact`, label: t("links.contact") },
  ];

  return (
    <header className="pt-5 sm:pt-7">
      <LandingContainer>
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-full border border-border/70 bg-card/90 px-4 py-3 shadow-[0_12px_40px_-24px_rgba(4,2,2,0.18)] backdrop-blur",
            isRtl ? "lg:flex-row-reverse" : "lg:flex-row",
          )}
        >
          <Link
            href={ROUTES.home}
            className="shrink-0 transition-opacity hover:opacity-85"
            aria-label={t("brandLabel")}
          >
            <Logo className="h-7 w-auto sm:h-8" width={120} height={44} />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div
            className={cn(
              "flex items-center gap-2 sm:gap-3",
              isRtl ? "flex-row-reverse" : "flex-row",
            )}
          >
            <Link
              href={ROUTES.home}
              locale={nextLocale}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-transparent px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>{t("actions.localeSwitch")}</span>
              <ChevronDown className="size-4" />
            </Link>

            <Button
              asChild
              size="sm"
              className="h-10 rounded-full px-5 text-sm font-medium text-primary-foreground shadow-none"
            >
              <Link href={ROUTES.login}>{t("actions.login")}</Link>
            </Button>
          </div>
        </div>
      </LandingContainer>
    </header>
  );
}
