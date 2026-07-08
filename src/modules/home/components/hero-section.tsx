import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import type { Locale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { HeroVisual } from "@/modules/home/components/hero-visual";
import { LandingContainer } from "@/modules/home/components/landing-container";
import { LandingSectionBadge } from "@/modules/home/components/landing-section-badge";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

interface HeroSectionProps {
  locale: Locale;
}

export async function HeroSection({ locale }: HeroSectionProps) {
  const t = await getTranslations("home.hero");
  const isRtl = locale === "ar";

  return (
    <section className="overflow-hidden pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
      <LandingContainer>
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <div className={cn("order-2", isRtl ? "lg:order-1" : "lg:order-2")}>
            <HeroVisual locale={locale} />
          </div>

          <div
            className={cn(
              "order-1 flex flex-col items-center text-center",
              isRtl
                ? "lg:order-2 lg:items-end lg:text-right"
                : "lg:order-1 lg:items-start lg:text-left",
            )}
          >
            <LandingSectionBadge>{t("eyebrow")}</LandingSectionBadge>

            <h1 className="mt-6 max-w-[12ch] text-display-sm font-semibold tracking-tight text-foreground sm:text-display-lg lg:text-[3.5rem]">
              <span className="text-primary">{t("titleAccent")}</span>
              <span className="block text-foreground">{t("titleRest")}</span>
            </h1>

            <p className="mt-5 max-w-[560px] text-base font-regular text-muted-foreground sm:text-lg lg:text-xl">
              {t("description")}
            </p>

            <div
              className={cn(
                "mt-8 flex w-full justify-center",
                isRtl ? "lg:justify-end" : "lg:justify-start",
              )}
            >
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-8 text-base font-medium text-primary-foreground sm:h-14 sm:px-10 sm:text-lg"
              >
                <Link href={ROUTES.register}>{t("primaryCta")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </LandingContainer>
    </section>
  );
}
