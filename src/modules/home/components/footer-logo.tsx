import { getTranslations } from "next-intl/server";
import type { ComponentPropsWithoutRef } from "react";

import { ROUTES } from "@/config/routes";
import type { Locale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/shared/ui/logo";
import { cn } from "@/shared/lib/utils";

interface FooterLogoProps extends ComponentPropsWithoutRef<"div"> {
  locale: Locale;
  description?: string | null;
}

export async function FooterLogo({
  locale,
  description,
  className,
  ...props
}: FooterLogoProps) {
  const t = await getTranslations("home.footer");
  const isRtl = locale === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(
        "mx-auto flex w-full max-w-[460px] flex-col items-center gap-4 text-center md:gap-6 lg:max-w-[320px]",
        isRtl
          ? "lg:mr-0 lg:ml-auto lg:items-start lg:text-right"
          : "lg:mr-auto lg:ml-0 lg:items-start lg:text-left",
        className,
      )}
      {...props}
    >
      <Link href={ROUTES.home} aria-label={t("brandLabel")}>
        <Logo className="h-11 w-auto sm:h-[52px]" width={182} height={68} />
      </Link>

      <p
        dir={isRtl ? "rtl" : "ltr"}
        className="text-sm leading-[1.7] font-regular text-foreground/80 sm:text-md"
      >
        {isRtl ? t("description") : description || t("description")}
      </p>
    </div>
  );
}
