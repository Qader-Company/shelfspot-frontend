function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const supportedLocales = parseList(
  process.env.NEXT_PUBLIC_SUPPORTED_LOCALES,
);
const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE?.trim();
const rtlLocales = new Set(parseList(process.env.NEXT_PUBLIC_RTL_LOCALES));

if (supportedLocales.length === 0) {
  throw new Error(
    "NEXT_PUBLIC_SUPPORTED_LOCALES must contain at least one locale.",
  );
}

if (!defaultLocale || !supportedLocales.includes(defaultLocale)) {
  throw new Error(
    "NEXT_PUBLIC_DEFAULT_LOCALE must be one of NEXT_PUBLIC_SUPPORTED_LOCALES.",
  );
}

export const locales = supportedLocales as [string, ...string[]];
export const configuredDefaultLocale = defaultLocale;
export type Locale = (typeof locales)[number];

export function getLocaleDirection(locale: string): "rtl" | "ltr" {
  return rtlLocales.has(locale) ? "rtl" : "ltr";
}
