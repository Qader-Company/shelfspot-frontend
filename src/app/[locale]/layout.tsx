import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Poppins } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import "@/app/globals.css";
import { getLocaleDirection } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { AppProvider } from "@/providers/app-provider";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-sans-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      className={`${ibmPlexSansArabic.variable} ${poppins.variable}`}
      lang={locale}
      dir={getLocaleDirection(locale)}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider>
          <AppProvider>{children}</AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
