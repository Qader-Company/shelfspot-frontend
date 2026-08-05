import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { ROUTES } from "@/config/routes";
import type { Locale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
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
        "flex w-full items-center justify-center lg:-mt-28 lg:min-w-0 lg:flex-[1.08] xl:mt-0 xl:w-[min(48.681vw,701px)] xl:flex-none",
        isRtl
          ? "lg:translate-x-12 xl:-mr-2 xl:translate-x-6"
          : "lg:translate-x-20 xl:-ml-2 xl:translate-x-64",
      )}
    >
      <div className="relative mx-auto aspect-square w-full max-w-[400px] overflow-visible sm:max-w-[500px] lg:max-w-[600px] xl:aspect-[701/733] xl:max-w-[701px]">
        <Image
          src={isRtl ? "/company/hero-ar.png" : "/company/hero-en.png"}
          alt={t("visualAlt")}
          fill
          className={cn(
            "pointer-events-none object-contain object-center select-none",
            isRtl
              ? "scale-[0.94] lg:scale-[1.08] xl:-translate-y-[20%] xl:scale-[1.1]"
              : "lg:scale-[1.16] xl:-translate-y-[18%] xl:scale-[1.2]",
          )}
          sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1279px) 500px, 701px"
          priority
        />
      </div>
    </div>
  );

  const textSlot = (
    <div
      className={cn(
        "flex w-full flex-col gap-5 text-center sm:gap-6 lg:min-w-0 lg:flex-[0.92] lg:max-w-[580px] lg:pt-8 xl:w-[min(42.986vw,619px)] xl:max-w-[619px] xl:flex-none xl:gap-6 xl:pt-[clamp(80px,6.806vw,98px)]",
        isRtl
          ? "items-center lg:items-end lg:text-right"
          : "items-center lg:items-start lg:text-left",
      )}
    >
      <h1 className="max-w-[619px] text-[clamp(2rem,3vw,2.75rem)] leading-[1.3] font-semibold text-foreground xl:text-[clamp(44px,4.444vw,64px)] xl:leading-[1.4]">
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

      <p className="max-w-[619px] text-[clamp(0.9375rem,1.05vw,1rem)] leading-[1.6] font-light text-foreground/80 xl:text-[clamp(16px,1.667vw,24px)] xl:leading-[1.5]">
        {t("description")}
      </p>

      <Button
        asChild
        className="h-12 min-w-[104px] w-fit rounded-[10px] border border-primary bg-primary px-4 py-2 text-[clamp(0.95rem,1.1vw,1rem)] font-semibold text-white shadow-none hover:bg-primary/90 hover:text-white sm:min-w-[118px] sm:px-[18px] sm:py-[10px] xl:h-[clamp(52px,4.167vw,60px)] xl:w-[clamp(150px,12.431vw,179px)] xl:rounded-lg xl:px-[18px] xl:text-[clamp(16px,1.667vw,24px)] xl:leading-[1.5] [&_*]:text-white"
      >
        <Link href={ROUTES.register}>{t("primaryCta")}</Link>
      </Button>
    </div>
  );

  return (
    <section className="overflow-x-clip bg-card pb-12 pt-10 sm:pb-16 sm:pt-12 lg:pb-14 lg:pt-10 xl:pb-0 xl:pt-[clamp(24px,2.153vw,31px)]">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-5 lg:px-6">
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
      </div>
    </section>
  );
}
