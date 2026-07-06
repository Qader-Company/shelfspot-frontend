import { defineRouting } from "next-intl/routing";

import { configuredDefaultLocale, locales } from "@/i18n/locale";

export const routing = defineRouting({
  locales,
  defaultLocale: configuredDefaultLocale,
  localePrefix: "always",
});
