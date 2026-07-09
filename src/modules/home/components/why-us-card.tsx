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
        "flex min-h-[172px] flex-col rounded-[24px] border border-border/70 bg-card px-8 py-7 shadow-[0_12px_32px_-28px_rgba(4,2,2,0.16)]",
        isRtl ? "items-end text-right" : "items-start text-left",
      )}
    >
      <div className="mb-8 inline-flex size-12 items-center justify-center rounded-full bg-accent">
        <Image src={iconSrc} alt={iconAlt} width={24} height={24} />
      </div>

      <h3 className="text-display-sm font-semibold text-foreground">
        {title}
      </h3>

      <p className="mt-4 text-base font-regular text-foreground/80">
        {description}
      </p>
    </article>
  );
}
