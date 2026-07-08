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
  const nextLocale = locale === "ar" ? "en" : "ar";
  const isRtl = locale === "ar";
  const currentLocaleLabel = isRtl ? "AR" : "EN";

  const links = [
    { href: ROUTES.home, label: t("links.home"), isActive: true },
    { href: "#about", label: t("links.about") },
    { href: "#features", label: t("links.whyShelfSpot") },
    { href: "#how-it-works", label: t("links.howItWorks") },
    { href: "#contact", label: t("links.contact") },
  ];

  const logoSlot = (
    <div className="flex shrink-0 items-center">
      <Link href={ROUTES.home} aria-label={t("brandLabel")} className="shrink-0">
        <Logo className="h-[68px] w-[182px]" width={182} height={68} />
      </Link>
    </div>
  );

  const localeSwitcher = (
    <Link
      href={ROUTES.home}
      locale={nextLocale}
      className="inline-flex items-center gap-1.5 text-xl font-medium text-foreground transition-colors hover:text-primary lg:text-[20px]"
    >
      <ChevronDown className="size-4" />
      <span>{currentLocaleLabel}</span>
    </Link>
  );

  const ctaButton = (
    <Button
      asChild
      className="h-14 w-[118px] rounded-[10px] border border-primary bg-primary px-[18px] py-[10px] text-xl font-semibold text-white shadow-none hover:bg-primary/90 hover:text-white lg:text-[20px] [&_*]:text-white"
    >
      <Link href={ROUTES.login}>{t("actions.login")}</Link>
    </Button>
  );

  const actionSlot = isRtl ? (
    <div className="flex shrink-0 items-center gap-3">
      {ctaButton}
      {localeSwitcher}
    </div>
  ) : (
    <div className="flex shrink-0 items-center gap-3">
      {localeSwitcher}
      {ctaButton}
    </div>
  );

  return (
    <header className="pt-6 sm:pt-8 lg:pt-16">
      <LandingContainer>
        <div
          dir="ltr"
          className="flex h-[68px] items-center justify-between gap-6"
        >
          {isRtl ? actionSlot : logoSlot}

          <nav
            dir={isRtl ? "rtl" : "ltr"}
            className="hidden flex-1 items-center justify-center gap-8 lg:flex"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href.startsWith("#") ? `${ROUTES.home}${link.href}` : link.href}
                className={cn(
                  "text-xl font-medium transition-colors hover:text-primary",
                  "lg:text-[20px]",
                  "isActive" in link && link.isActive
                    ? "text-primary"
                    : "text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {isRtl ? logoSlot : actionSlot}
        </div>
      </LandingContainer>
    </header>
  );
}
