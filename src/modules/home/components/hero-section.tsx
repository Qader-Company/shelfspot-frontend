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

  const imageSlot = (
    <div className="w-full lg:w-1/2 lg:shrink-0">
      <div
        className={cn(
          "relative mx-auto w-full overflow-hidden lg:-mt-20",
          isRtl
            ? "aspect-[1006/822] max-w-[500px] lg:max-w-[590px]"
            : "aspect-square max-w-[460px] sm:max-w-[500px] lg:max-w-[540px]",
        )}
      >
        <Image
          src={isRtl ? "/company/hero-ar.png" : "/company/hero-en.png"}
          alt={t("visualAlt")}
          fill
          className={cn(
            "pointer-events-none select-none",
            isRtl
              ? "object-contain object-center"
              : "object-cover object-right",
          )}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
    </div>
  );

  const textSlot = (
    <div
      className={cn(
        "flex w-full flex-col gap-5 text-center sm:gap-6 lg:w-1/2 lg:max-w-[600px]",
        isRtl
          ? "items-center lg:items-end lg:text-right"
          : "items-center lg:items-start lg:text-left",
      )}
    >
      <h1 className="max-w-[686px] text-[clamp(2rem,4.5vw,4rem)] leading-[1.3] font-semibold text-foreground">
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

      <p className="max-w-[686px] text-[clamp(1rem,1.65vw,1.5rem)] leading-[1.6] font-light text-foreground/80">
        {t("description")}
      </p>

      <Button
        asChild
        className="h-12 min-w-[104px] w-fit rounded-[10px] border border-primary bg-primary px-4 py-2 text-[clamp(1rem,1.4vw,1.25rem)] font-semibold text-white shadow-none hover:bg-primary/90 hover:text-white sm:h-14 sm:min-w-[118px] sm:px-[18px] sm:py-[10px] [&_*]:text-white"
      >
        <Link href={ROUTES.register}>{t("primaryCta")}</Link>
      </Button>
    </div>
  );

  return (
    <section className="overflow-x-clip bg-card pb-12 pt-8 sm:pb-20 sm:pt-10 lg:pb-24 lg:pt-14">
      <LandingContainer>
        <div
          dir="ltr"
          className={cn(
            "flex flex-col gap-10 lg:items-start lg:justify-between lg:gap-8",
            isRtl ? "lg:flex-row-reverse" : "lg:flex-row",
          )}
        >
          {textSlot}
          {imageSlot}
        </div>
      </LandingContainer>
    </section>
  );
}
