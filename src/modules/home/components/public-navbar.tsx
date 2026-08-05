import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import type { Locale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { LandingContainer } from "@/modules/home/components/landing-container";
import { MobileNavigation } from "@/modules/home/components/mobile-navigation";
import { PublicLocaleSwitcher } from "@/modules/home/components/public-locale-switcher";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/logo";

interface PublicNavbarProps {
  locale: Locale;
}

export async function PublicNavbar({ locale }: PublicNavbarProps) {
  const t = await getTranslations("home.navbar");
  const isRtl = locale === "ar";

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
        <Logo
          className="h-9 w-24 sm:h-[58px] sm:w-[155px] lg:h-[68px] lg:w-[182px]"
          width={182}
          height={68}
        />
      </Link>
    </div>
  );

  const localeSwitcher = (
    <PublicLocaleSwitcher label={t("actions.localeSwitch")} />
  );

  const ctaButton = (
    <Button
      asChild
      className="relative z-20 hidden h-10 w-auto min-w-[82px] shrink-0 whitespace-nowrap rounded-lg border border-primary bg-primary px-2.5 py-2 text-xs font-semibold text-white shadow-none hover:bg-primary/90 hover:text-white lg:inline-flex lg:h-14 lg:w-[118px] lg:px-[18px] lg:py-[10px] lg:text-[20px] [&_*]:text-white"
    >
      <Link href={ROUTES.login}>{t("actions.login")}</Link>
    </Button>
  );

  const actionSlot = isRtl ? (
    <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-3">
      {ctaButton}
      {localeSwitcher}
    </div>
  ) : (
    <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-3">
      {localeSwitcher}
      {ctaButton}
    </div>
  );

  const mobileNavigation = (
    <MobileNavigation
      locale={locale}
      menuLabel={t("actions.menu")}
      closeLabel={t("actions.closeMenu")}
      loginLabel={t("actions.login")}
      loginHref={ROUTES.login}
      links={links.map((link) => ({
        ...link,
        href: link.href.startsWith("#")
          ? `${ROUTES.home}${link.href}`
          : link.href,
      }))}
    />
  );

  return (
    <header className="relative z-20 overflow-x-clip bg-card pt-3 sm:pt-8 lg:pt-16">
      <LandingContainer>
        <div
          dir="ltr"
          className="flex h-11 min-w-0 items-center justify-between gap-2 sm:h-[58px] sm:gap-4 lg:h-[68px] lg:gap-6"
        >
          {isRtl ? (
            <>
              {mobileNavigation}
              {actionSlot}
            </>
          ) : (
            logoSlot
          )}

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

          {isRtl ? (
            logoSlot
          ) : (
            <>
              {actionSlot}
              {mobileNavigation}
            </>
          )}
        </div>
      </LandingContainer>
    </header>
  );
}
