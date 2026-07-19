import { notFound } from "next/navigation";
import { getLocaleDirection } from "@/i18n/locale";
import { ResetPasswordPageView } from "@/modules/auth/components";
import { isAuthContext } from "@/modules/auth/config/auth-context";

export default async function AuthResetPasswordPage({ params }: { params: Promise<{ locale: string; authContext: string }> }) {
  const { locale, authContext } = await params;
  if (!isAuthContext(authContext)) notFound();
  return <ResetPasswordPageView direction={getLocaleDirection(locale)} authContext={authContext} />;
}
