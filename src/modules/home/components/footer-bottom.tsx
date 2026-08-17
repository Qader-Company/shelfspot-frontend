import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/locale";

interface FooterBottomProps {
  locale: Locale;
}

export async function FooterBottom({ locale }: FooterBottomProps) {
  const t = await getTranslations("home.footer");
  const isRtl = locale === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="border-t border-border/70 px-4 py-4 text-center sm:py-5"
    >
      <p className="text-xs leading-[1.6] font-regular text-foreground/70 sm:text-sm">
        {t("bottom.copy")}
      </p>
    </div>
  );
}
