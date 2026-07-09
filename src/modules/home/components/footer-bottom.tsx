import { getTranslations } from "next-intl/server";

export async function FooterBottom() {
  const t = await getTranslations("home.footer");

  return (
    <div className="border-t border-border/70 py-5 text-center">
      <p className="text-sm font-regular text-foreground/70">
        {t("bottom.copy")}
      </p>
    </div>
  );
}
