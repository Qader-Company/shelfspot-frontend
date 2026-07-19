import { getLocaleDirection } from "@/i18n/locale";
import { ResetPasswordPageView } from "@/modules/auth/components";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ResetPasswordPageView
      authContext="company"
      direction={getLocaleDirection(locale)}
    />
  );
}
