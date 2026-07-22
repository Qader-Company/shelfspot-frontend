import { getLocaleDirection } from "@/i18n/locale";
import { ResetPasswordPageView } from "@/modules/auth/components";

export default async function AdminResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ResetPasswordPageView
      authContext="admin"
      direction={getLocaleDirection(locale)}
    />
  );
}
