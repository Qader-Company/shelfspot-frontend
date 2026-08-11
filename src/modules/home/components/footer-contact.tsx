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
        "flex flex-col items-center gap-4 text-center",
        isRtl
          ? "md:items-start md:text-right"
          : "md:items-start md:text-left",
      )}
    >
      <h3
        className={cn(
          "w-full text-lg font-semibold text-foreground sm:text-xl",
          isRtl ? "text-center md:text-right" : "text-center md:text-left",
        )}
      >
        {t("contact.title")}
      </h3>

      <p
        dir={isRtl ? "rtl" : "ltr"}
        className={cn(
          "w-full text-sm font-regular text-foreground/80 sm:text-md",
          isRtl ? "text-center md:text-right" : "text-center md:text-left",
        )}
      >
        {isRtl
          ? t("contact.location")
          : settings?.address || t("contact.location")}
      </p>

      <div
        className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-start"
      >
        {contacts.map((contact) => {
          const Icon = contact.icon;

          return (
            <a
              key={contact.label}
              href={contact.href}
              dir={isRtl ? "rtl" : "ltr"}
              className={cn(
                "inline-flex h-10 w-full max-w-[280px] items-center justify-center gap-2 rounded-[10px] border px-4 text-sm font-medium transition-colors sm:w-auto sm:max-w-full",
                contact.variant === "primary"
                  ? "border-primary bg-primary text-white hover:bg-primary/90"
                  : "border-border bg-card text-foreground hover:border-primary/50",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span dir="ltr" className="min-w-0 truncate">
                {contact.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
