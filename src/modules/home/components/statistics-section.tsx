import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/locale";
import { LandingContainer } from "@/modules/home/components/landing-container";
import { StatisticCard } from "@/modules/home/components/statistic-card";
import { cn } from "@/shared/lib/utils";

interface StatisticsSectionProps {
  locale: Locale;
}

export async function StatisticsSection({
  locale,
}: StatisticsSectionProps) {
  const t = await getTranslations("home.statistics");
  const isRtl = locale === "ar";

  const statistics = [
    {
      value: t("items.merchandisers.value"),
      label: t("items.merchandisers.label"),
    },
    {
      value: t("items.approvalRate.value"),
      label: t("items.approvalRate.label"),
    },
    {
      value: t("items.companies.value"),
      label: t("items.companies.label"),
    },
    {
      value: t("items.tasks.value"),
      label: t("items.tasks.label"),
    },
  ];

  return (
    <section id="statistics" className="py-6 sm:py-7 lg:py-8">
      <div className="mx-auto w-full max-w-[1184px] px-4 sm:px-5 lg:px-0">
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
              <span>{t("eyebrow")}</span>
            </div>

            <h2 className="section-heading">
              {t("title")}
            </h2>
          </div>

          {!isRtl ? <div /> : null}
        </div>
      </div>

      <div className="mt-6 bg-accent py-10 sm:py-12 lg:mt-8 lg:py-12">
        <LandingContainer>
          <div className="grid gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
            {statistics.map((statistic, index) => (
              <div
                key={statistic.label}
                className="scroll-reveal-card"
                style={{ transitionDelay: `${120 + index * 170}ms` }}
              >
                <StatisticCard
                  value={statistic.value}
                  label={statistic.label}
                />
              </div>
            ))}
          </div>
        </LandingContainer>
      </div>
    </section>
  );
}
