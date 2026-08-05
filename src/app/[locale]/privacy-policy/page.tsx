import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/locale";
import { PublicContentPage } from "@/modules/home/components/public-content-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("publicPages.privacy");
  return { title: t("title"), description: t("intro") };
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <PublicContentPage locale={locale} page="privacy" />;
}
