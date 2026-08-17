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
      <div className="mb-6 inline-flex size-14 items-center justify-center rounded-full bg-accent sm:mb-7 sm:size-16">
        <Image
          src={iconSrc}
          alt={iconAlt}
          width={40}
          height={40}
          className="size-8 object-contain sm:size-10"
        />
      </div>

      <h3 className="text-[clamp(1.125rem,2vw,1.75rem)] leading-[1.4] font-semibold text-foreground">
        {title}
      </h3>

      <p className="mt-3 text-[clamp(0.875rem,1.2vw,1rem)] leading-[1.6] font-regular text-foreground/80 sm:mt-4">
        {description}
      </p>
    </article>
  );
}
