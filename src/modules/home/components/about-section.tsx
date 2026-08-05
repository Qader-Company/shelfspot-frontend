import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/locale";
import { AboutVisual } from "@/modules/home/components/about-visual";
import { LandingContainer } from "@/modules/home/components/landing-container";
import { cn } from "@/shared/lib/utils";

interface AboutSectionProps {
  locale: Locale;
}

export async function AboutSection({
  locale,
}: AboutSectionProps) {
  const t = await getTranslations("home.about");
  const isRtl = locale === "ar";

  const visualSlot = (
    <div className={cn("scroll-reveal-artwork", isRtl ? "from-left" : "from-right")}>
      <AboutVisual />
    </div>
  );

  const contentSlot = (
    <div
      className={cn(
        "flex w-full max-w-[560px] flex-col gap-6 text-center md:max-w-none",
        isRtl
          ? "items-center md:items-end md:text-right"
          : "items-center md:items-start md:text-left",
      )}
    >
      <div
        className={cn(
          "section-label flex items-center gap-2",
          isRtl ? "flex-row-reverse" : "flex-row",
        )}
      >
        <span className="text-primary">/</span>
        <span>{t("eyebrow")}</span>
      </div>

      <h2 className="section-heading">
        {t("title")}
      </h2>

      <h3 className="section-subheading">
        {t("subtitle")}
      </h3>

      <div className="section-body space-y-4">
        <p>{t("paragraphOne")}</p>
        <p>{t("paragraphTwo")}</p>
      </div>
    </div>
  );

  return (
    <section id="about" className="py-16 sm:py-20 lg:py-24">
      <LandingContainer>
        <div
          dir="ltr"
          className="grid gap-10 md:grid-cols-2 md:items-center md:gap-8 lg:gap-14"
        >
          {isRtl ? (
            <>
              {visualSlot}
              {contentSlot}
            </>
          ) : (
            <>
              {contentSlot}
              {visualSlot}
            </>
          )}
        </div>
      </LandingContainer>
    </section>
  );
}
