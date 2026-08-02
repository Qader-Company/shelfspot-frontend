import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import type { Locale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";

interface FooterNavigationProps {
  locale: Locale;
}

export async function FooterNavigation({
  locale,
}: FooterNavigationProps) {
  const t = await getTranslations("home.footer");
  const isRtl = locale === "ar";

  const groups = [
    {
      title: t("navigation.quickLinks.title"),
      links: [
        { href: ROUTES.home, label: t("navigation.quickLinks.links.home") },
        { href: `${ROUTES.home}#services`, label: t("navigation.quickLinks.links.services") },
        { href: `${ROUTES.home}#how-it-works`, label: t("navigation.quickLinks.links.workMechanism") },
        { href: `${ROUTES.home}#statistics`, label: t("navigation.quickLinks.links.successPartners") },
        { href: `${ROUTES.home}#about`, label: t("navigation.quickLinks.links.aboutUs") },
      ],
    },
    {
      title: t("navigation.support.title"),
      links: [
        { href: `${ROUTES.home}#privacy-policy`, label: t("navigation.support.links.privacyPolicy") },
        { href: `${ROUTES.home}#contact`, label: t("navigation.support.links.contactUs") },
        { href: `${ROUTES.home}#terms-and-conditions`, label: t("navigation.support.links.termsConditions") },
        { href: `${ROUTES.home}#faqs`, label: t("navigation.support.links.faqs") },
      ],
    },
  ];

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="grid gap-8 min-[440px]:grid-cols-2 lg:gap-14"
    >
      {groups.map((group) => (
        <div
          key={group.title}
          className={cn(
            "flex flex-col items-center gap-4 text-center",
            isRtl
              ? "min-[440px]:items-start min-[440px]:text-right"
              : "min-[440px]:items-start min-[440px]:text-left",
          )}
        >
          <h3
            className={cn(
              "w-full text-lg font-semibold text-foreground sm:text-xl",
              isRtl
                ? "text-center min-[440px]:text-right"
                : "text-center min-[440px]:text-left",
            )}
          >
            {group.title}
          </h3>

          <div
            className={cn(
              "flex w-full flex-col items-center gap-3",
              isRtl
                ? "min-[440px]:items-start min-[440px]:text-right"
                : "min-[440px]:items-start min-[440px]:text-left",
            )}
          >
            {group.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                dir={isRtl ? "rtl" : "ltr"}
                className={cn(
                  "block w-full text-sm font-regular text-foreground/80 transition-colors hover:text-primary sm:text-md",
                  isRtl
                    ? "text-center min-[440px]:text-right"
                    : "text-center min-[440px]:text-left",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
