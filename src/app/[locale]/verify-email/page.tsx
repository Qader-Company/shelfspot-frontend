import { getLocaleDirection } from "@/i18n/locale";
import { VerifyEmailPageView } from "@/modules/auth/components";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <VerifyEmailPageView direction={getLocaleDirection(locale)} />;
}
