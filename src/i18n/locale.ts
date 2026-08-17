export const locales = ["ar", "en"] as const;
export const configuredDefaultLocale = "ar" as const;
export type Locale = (typeof locales)[number];

export function getLocaleDirection(locale: string): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}
