import { getLocaleDirection } from "@/i18n/locale";
import { OtpVerificationPageView } from "@/modules/auth/components";

export default async function OtpVerificationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <OtpVerificationPageView
      authContext="company"
      direction={getLocaleDirection(locale)}
    />
  );
}
