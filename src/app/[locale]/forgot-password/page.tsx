import { getLocaleDirection } from "@/i18n/locale";
import { ForgotPasswordPageView } from "@/modules/auth/components";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ForgotPasswordPageView
      authContext="company"
      direction={getLocaleDirection(locale)}
    />
  );
}
