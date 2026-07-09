import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import type { Locale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/shared/ui/logo";
import { cn } from "@/shared/lib/utils";

interface FooterLogoProps {
  locale: Locale;
}

export async function FooterLogo({
  locale,
}: FooterLogoProps) {
  const t = await getTranslations("home.footer");
  const isRtl = locale === "ar";

  return (
    <div
      className={cn(
        "flex max-w-[320px] flex-col gap-6",
        isRtl ? "items-end text-right" : "items-start text-left",
      )}
    >
      <Link href={ROUTES.home} aria-label={t("brandLabel")}>
        <Logo className="h-[52px] w-auto" width={182} height={68} />
      </Link>

      <p className="text-md leading-[1.6] font-regular text-foreground/80">
        {t("description")}
      </p>
    </div>
  );
}
