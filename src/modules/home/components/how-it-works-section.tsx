import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import type { Locale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

import { LandingContainer } from "@/modules/home/components/landing-container";
import { TimelineStepCard } from "@/modules/home/components/timeline-step-card";

interface HowItWorksSectionProps {
  locale: Locale;
}

export async function HowItWorksSection({
  locale,
}: HowItWorksSectionProps) {
  const t = await getTranslations("home.howItWorksSection");
  const isRtl = locale === "ar";

  const steps = [
    {
      id: "01",
      title: t("steps.request.title"),
      description: t("steps.request.description"),
      side: "right" as const,
    },
    {
      id: "02",
      title: t("steps.assignment.title"),
      description: t("steps.assignment.description"),
      side: "left" as const,
    },
    {
      id: "03",
      title: t("steps.execution.title"),
      description: t("steps.execution.description"),
      side: "right" as const,
    },
    {
      id: "04",
      title: t("steps.review.title"),
      description: t("steps.review.description"),
      side: "left" as const,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24">
      <LandingContainer>
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

        <div className="relative mt-12">
          <div className="absolute inset-x-1/2 hidden h-full w-px -translate-x-1/2 bg-accent md:block" />

          <div className="flex flex-col gap-6 md:gap-2">
            {steps.map((step, index) => {
              const isLeft = step.side === "left";

              return (
                <div
                  key={step.id}
                  dir="ltr"
                  className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr] md:gap-10"
                >
                  <div className={cn("hidden md:block", isLeft ? "" : "invisible")}>
                    {isLeft ? (
                      <TimelineStepCard
                        title={step.title}
                        description={step.description}
                      />
                    ) : null}
                  </div>

                  <div className="relative z-10 flex justify-center">
                    <div
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full border-2 border-primary text-base font-medium",
                        index === 0
                          ? "bg-primary text-white"
                          : "bg-card text-primary",
                      )}
                    >
                      {index + 1}
                    </div>
                  </div>

                  <div className={cn("hidden md:block", isLeft ? "invisible" : "")}>
                    {!isLeft ? (
                      <TimelineStepCard
                        title={step.title}
                        description={step.description}
                      />
                    ) : null}
                  </div>

                  <div className="md:hidden">
                    <TimelineStepCard
                      title={step.title}
                      description={step.description}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 text-center lg:mt-10">
          <p className="text-base font-regular text-foreground sm:text-lg">
            {t("ctaLabel")}
          </p>

          <Button
            asChild
            className="h-12 min-w-[104px] rounded-[10px] border border-primary bg-primary px-4 py-2 text-base font-semibold text-white shadow-none hover:bg-primary/90 hover:text-white sm:h-14 sm:min-w-[118px] sm:px-[18px] sm:py-[10px] sm:text-xl [&_*]:text-white"
          >
            <Link href={ROUTES.register}>{t("ctaAction")}</Link>
          </Button>
        </div>
      </LandingContainer>
    </section>
  );
}
