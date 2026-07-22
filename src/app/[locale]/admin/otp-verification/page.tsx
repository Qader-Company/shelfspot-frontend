import { getLocaleDirection } from "@/i18n/locale";
import { OtpVerificationPageView } from "@/modules/auth/components";

export default async function AdminOtpVerificationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <OtpVerificationPageView
      authContext="admin"
      direction={getLocaleDirection(locale)}
    />
  );
}
