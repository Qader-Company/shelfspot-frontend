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
    <div
      className={cn(
        "flex w-full items-center justify-center lg:-mt-28 lg:min-w-0 lg:flex-[1.08] xl:-mt-36",
        isRtl
          ? "lg:-translate-x-12 xl:-translate-x-32"
          : "lg:translate-x-12 xl:translate-x-32",
      )}
    >
      <div className="relative mx-auto aspect-square w-full max-w-[400px] overflow-visible sm:max-w-[500px] lg:max-w-[600px] xl:max-w-[640px]">
        <Image
          src={isRtl ? "/company/hero-ar.png" : "/company/hero-en.png"}
          alt={t("visualAlt")}
          fill
          className="pointer-events-none object-contain object-center select-none lg:scale-[1.16] xl:scale-[1.2]"
          sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1279px) 500px, 640px"
          priority
        />
      </div>
    </div>
  );

  const textSlot = (
    <div
      className={cn(
        "flex w-full flex-col gap-5 text-center sm:gap-6 lg:min-w-0 lg:flex-[1.08] lg:max-w-[620px]",
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
    <section className="overflow-x-clip bg-card pb-12 pt-10 sm:pb-16 sm:pt-12 lg:pb-14 lg:pt-10 xl:pb-12 xl:pt-8">
      <LandingContainer>
        <div
          dir="ltr"
          className={cn(
            "flex flex-col gap-8 sm:gap-10 lg:items-start lg:justify-between lg:gap-8 xl:gap-10",
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
