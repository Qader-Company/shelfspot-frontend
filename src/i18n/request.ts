import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  let messages = {};

  try {
    messages = (await import(`./messages/${locale}.json`)).default;
  } catch {
    // Message catalogs are added after the supported locales are configured.
  }

  return { locale, messages };
});
