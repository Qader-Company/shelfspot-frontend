import type { Locale } from "@/i18n/locale";
import { HomePageView } from "@/modules/home/components";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <HomePageView locale={locale} />;
}
