import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import type { Locale } from "@/i18n/locale";
import { LandingContainer } from "@/modules/home/components/landing-container";
import { WhyUsCard } from "@/modules/home/components/why-us-card";
import { cn } from "@/shared/lib/utils";

interface WhyUsSectionProps {
  locale: Locale;
}

function renderMixedBrandTitle({
  prefix,
  suffix,
  brand,
  isRtl,
}: {
  prefix: string;
  suffix: string;
  brand: ReactNode;
  isRtl: boolean;
}) {
  if (isRtl) {
    return (
      <>
        <span>{prefix} </span>
        {brand}
        <span>{suffix}</span>
      </>
    );
  }

  return (
    <>
      <span>{prefix} </span>
      {brand}
      <span> {suffix}</span>
    </>
  );
}

export async function WhyUsSection({
  locale,
}: WhyUsSectionProps) {
  const t = await getTranslations("home.whyShelfSpot");
  const isRtl = locale === "ar";
  const brand = <bdi dir="ltr">ShelfSpot</bdi>;

  const items = [
    {
      iconSrc: "/home/icons/visibility.svg",
      iconAlt: t("items.visibility.iconAlt"),
      title: t("items.visibility.title"),
      description: t("items.visibility.description"),
    },
    {
      iconSrc: "/home/icons/centeralized.svg",
      iconAlt: t("items.centralized.iconAlt"),
      title: t("items.centralized.title"),
      description: t("items.centralized.description"),
    },
    {
      iconSrc: "/home/icons/flexible.svg",
      iconAlt: t("items.flexible.iconAlt"),
      title: t("items.flexible.title"),
      description: t("items.flexible.description"),
    },
    {
      iconSrc: "/home/icons/secure.svg",
      iconAlt: t("items.secure.iconAlt"),
      title: t("items.secure.title"),
      description: t("items.secure.description"),
    },
  ];
  const leftColumnItems = isRtl ? [items[1], items[3]] : [items[0], items[2]];
  const rightColumnItems = isRtl ? [items[0], items[2]] : [items[1], items[3]];

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24">
      <LandingContainer>
        <div className="flex w-full flex-col gap-6">
          <div dir="ltr" className="grid gap-10 md:grid-cols-2 md:gap-8 lg:gap-14">
            {isRtl ? <div /> : null}

            <div
              className={cn(
                "flex w-full max-w-[560px] flex-col gap-4 text-center md:max-w-none",
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
                <span dir={isRtl ? "rtl" : "ltr"}>
                  {renderMixedBrandTitle({
                    prefix: t("eyebrowPrefix"),
                    suffix: t("eyebrowSuffix"),
                    brand,
                    isRtl,
                  })}
                </span>
              </div>

              <h2
                dir={isRtl ? "rtl" : "ltr"}
                className="section-heading"
              >
                {renderMixedBrandTitle({
                  prefix: t("titlePrefix"),
                  suffix: t("titleSuffix"),
                  brand,
                  isRtl,
                })}
              </h2>
            </div>

            {!isRtl ? <div /> : null}
          </div>

          <div dir="ltr" className="grid w-full gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-6">
              {leftColumnItems.map((item, index) => (
                <div
                  key={item.title}
                  className="scroll-reveal-card why-us-card-reveal"
                  style={{ transitionDelay: `${100 + index * 360}ms` }}
                >
                  <WhyUsCard
                    locale={locale}
                    iconSrc={item.iconSrc}
                    iconAlt={item.iconAlt}
                    title={item.title}
                    description={item.description}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-6">
              {rightColumnItems.map((item, index) => (
                <div
                  key={item.title}
                  className="scroll-reveal-card why-us-card-reveal"
                  style={{ transitionDelay: `${280 + index * 360}ms` }}
                >
                  <WhyUsCard
                    locale={locale}
                    iconSrc={item.iconSrc}
                    iconAlt={item.iconAlt}
                    title={item.title}
                    description={item.description}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </LandingContainer>
    </section>
  );
}
