import { Mail, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/locale";
import { cn } from "@/shared/lib/utils";
import type { PublicPlatformSettings } from "@/modules/home/services/platform-settings";

interface FooterContactProps {
  locale: Locale;
  settings?: PublicPlatformSettings | null;
}

export async function FooterContact({
  locale,
  settings,
}: FooterContactProps) {
  const t = await getTranslations("home.footer");
  const isRtl = locale === "ar";

  const contacts = [
    {
      href: `tel:${settings?.phone || "+966xxxxxxxxxx"}`,
      label: settings?.phone || t("contact.phone"),
      icon: Phone,
      variant: "primary" as const,
    },
    {
      href: `mailto:${settings?.email || "info@shelfspot.com"}`,
      label: settings?.email || t("contact.email"),
      icon: Mail,
      variant: "secondary" as const,
    },
  ];

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(
        "flex flex-col gap-4",
        isRtl ? "items-end text-right" : "items-start text-left",
      )}
    >
      <h3 className="text-lg font-semibold text-foreground sm:text-xl">
        {t("contact.title")}
      </h3>

      <p className="text-sm font-regular text-foreground/80 sm:text-md">
        {settings?.address || t("contact.location")}
      </p>

      <div className={cn("flex flex-wrap gap-3", isRtl ? "justify-end" : "justify-start")}>
        {contacts.map((contact) => {
          const Icon = contact.icon;

          return (
            <a
              key={contact.label}
              href={contact.href}
              dir={isRtl ? "rtl" : "ltr"}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-[10px] border px-4 text-sm font-medium transition-colors",
                contact.variant === "primary"
                  ? "border-primary bg-primary text-white hover:bg-primary/90"
                  : "border-border bg-card text-foreground hover:border-primary/50",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span dir="ltr">{contact.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
