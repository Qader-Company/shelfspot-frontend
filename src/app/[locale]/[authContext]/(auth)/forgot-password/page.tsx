import { notFound } from "next/navigation";
import { getLocaleDirection } from "@/i18n/locale";
import { ForgotPasswordPageView } from "@/modules/auth/components";
import { isAuthContext } from "@/modules/auth/config/auth-context";

export default async function AuthForgotPasswordPage({ params }: { params: Promise<{ locale: string; authContext: string }> }) {
  const { locale, authContext } = await params;
  if (!isAuthContext(authContext)) notFound();
  return <ForgotPasswordPageView direction={getLocaleDirection(locale)} authContext={authContext} />;
}
