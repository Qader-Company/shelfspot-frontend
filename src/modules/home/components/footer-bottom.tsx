import { getTranslations } from "next-intl/server";

export async function FooterBottom() {
  const t = await getTranslations("home.footer");

  return (
    <div className="border-t border-border/70 px-4 py-4 text-center sm:py-5">
      <p className="text-xs leading-[1.6] font-regular text-foreground/70 sm:text-sm">
        {t("bottom.copy")}
      </p>
    </div>
  );
}
