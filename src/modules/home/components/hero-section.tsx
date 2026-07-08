import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { ROUTES } from "@/config/routes";
import type { Locale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { LandingContainer } from "@/modules/home/components/landing-container";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

interface HeroSectionProps {
  locale: Locale;
}

export async function HeroSection({ locale }: HeroSectionProps) {
  const t = await getTranslations("home.hero");
  const isRtl = locale === "ar";

  return (
    <section className="pb-16 pt-8 sm:pb-20 sm:pt-10 lg:pb-24 lg:pt-14">
      <LandingContainer>
        <div
          className={cn(
            "flex flex-col gap-10 lg:items-center lg:justify-between lg:gap-12",
            isRtl ? "lg:flex-row" : "lg:flex-row-reverse",
          )}
        >
          <div className="flex-1">
            <div className="relative mx-auto h-[320px] w-full max-w-[540px] sm:h-[420px] lg:h-[520px]">
              <div className="absolute inset-x-[12%] top-8 h-[62%] rounded-full bg-accent" />
              <div className="absolute start-0 top-28 rounded-full bg-accent px-4 py-2 text-sm font-medium text-primary shadow-sm">
                {t("floatingCards.speed")}
              </div>
              <div className="absolute end-[6%] top-10 rounded-full bg-accent px-4 py-2 text-sm font-medium text-primary shadow-sm">
                {t("floatingCards.clarity")}
              </div>
              <div className="absolute start-1/2 top-[58%] -translate-x-1/2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-primary shadow-sm">
                {t("floatingCards.execution")}
              </div>
              <div className="absolute inset-x-[18%] bottom-0 top-14 rounded-[40px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
              <Image
                src="/auth/screens/login-screen.png"
                alt={t("visualAlt")}
                fill
                className={cn(
                  "object-contain object-bottom",
                  isRtl ? "scale-x-100" : "-scale-x-100",
                )}
                sizes="(max-width: 1024px) 100vw, 46vw"
                priority
              />
            </div>
          </div>

          <div
            className={cn(
              "flex w-full flex-col gap-6 text-center lg:max-w-[686px]",
              isRtl
                ? "items-center lg:items-end lg:text-right"
                : "items-center lg:items-start lg:text-left",
            )}
          >
            <h1 className="max-w-[686px] text-display-lg leading-[1.4] font-semibold text-foreground lg:text-display-2xl">
              {isRtl ? (
                <>
                  <span>{t("titlePrefix")}</span>{" "}
                  <span className="text-primary">{t("titleAccent")}</span>
                  <span className="block">{t("titleRest")}</span>
                </>
              ) : (
                <>
                  <span className="text-primary">{t("titleAccent")}</span>{" "}
                  <span>{t("titlePrefix")}</span>
                  <span className="block">{t("titleRest")}</span>
                </>
              )}
            </h1>

            <p className="max-w-[686px] text-display-xs leading-[1.5] font-light text-foreground/80">
              {t("description")}
            </p>

            <Button
              asChild
              className="h-14 min-w-[118px] w-fit rounded-[10px] border border-primary bg-primary px-[18px] py-[10px] text-xl font-semibold text-white shadow-none hover:bg-primary/90 hover:text-white lg:text-[20px] [&_*]:text-white"
            >
              <Link href={ROUTES.register}>{t("primaryCta")}</Link>
            </Button>
          </div>
        </div>
      </LandingContainer>
    </section>
  );
}
