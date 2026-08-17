import Image from "next/image";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/locale";
import { cn } from "@/shared/lib/utils";

interface HeroVisualProps {
  locale: Locale;
}

export async function HeroVisual({ locale }: HeroVisualProps) {
  const t = await getTranslations("home.hero");
  const isRtl = locale === "ar";
  const floatingCards = [
    {
      label: t("floatingCards.speed"),
      className: isRtl
        ? "end-0 top-10 sm:end-3 lg:end-0"
        : "start-0 top-10 sm:start-3 lg:start-0",
    },
    {
      label: t("floatingCards.clarity"),
      className: "start-1/2 top-[54%] -translate-x-1/2",
    },
    {
      label: t("floatingCards.execution"),
      className: isRtl
        ? "start-0 top-36 sm:start-4 lg:start-0"
        : "end-0 top-36 sm:end-4 lg:end-0",
    },
  ];

  return (
    <div className="relative mx-auto h-[360px] w-full max-w-[560px] sm:h-[420px] lg:h-[520px]">
      <div className="absolute inset-x-[12%] top-8 h-[58%] rounded-full bg-accent" />
      <div className="absolute start-[8%] top-24 size-12 rounded-full bg-primary/18 blur-md" />
      <div className="absolute end-[14%] top-6 size-6 rounded-full bg-primary/20" />
      <div className="absolute bottom-8 start-[2%] h-16 w-24 rounded-full bg-primary/12 blur-xl" />

      <div className="absolute inset-x-0 bottom-0 top-6">
        <div className="relative mx-auto h-full w-[74%] overflow-hidden">
          <Image
            src="/auth/screens/login-screen.png"
            alt={t("visualAlt")}
            fill
            className="object-cover object-left-top"
            sizes="(max-width: 1024px) 70vw, 36vw"
            priority
          />
        </div>
      </div>

      {floatingCards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "absolute rounded-full border border-primary/10 bg-card px-4 py-2 text-sm font-medium text-primary shadow-[0_12px_30px_-22px_rgba(4,2,2,0.28)]",
            card.className,
          )}
        >
          {card.label}
        </div>
      ))}
    </div>
  );
}
