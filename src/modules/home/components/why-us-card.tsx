import Image from "next/image";

import type { Locale } from "@/i18n/locale";
import { cn } from "@/shared/lib/utils";

interface WhyShelfSpotCardProps {
  description: string;
  iconAlt: string;
  iconSrc: string;
  locale: Locale;
  title: string;
}

export function WhyUsCard({
  description,
  iconAlt,
  iconSrc,
  locale,
  title,
}: WhyShelfSpotCardProps) {
  const isRtl = locale === "ar";

  return (
    <article
      className={cn(
        "flex min-h-[172px] flex-col rounded-[20px] border border-border/70 bg-card px-5 py-6 shadow-[0_12px_32px_-28px_rgba(4,2,2,0.16)] sm:rounded-[24px] sm:px-8 sm:py-7",
        isRtl ? "items-end text-right" : "items-start text-left",
      )}
    >
      <div className="mb-6 inline-flex size-11 items-center justify-center rounded-full bg-accent sm:mb-8 sm:size-12">
        <Image src={iconSrc} alt={iconAlt} width={24} height={24} />
      </div>

      <h3 className="text-xl font-semibold text-foreground sm:text-display-sm">
        {title}
      </h3>

      <p className="mt-3 text-sm font-regular text-foreground/80 sm:mt-4 sm:text-base">
        {description}
      </p>
    </article>
  );
}
