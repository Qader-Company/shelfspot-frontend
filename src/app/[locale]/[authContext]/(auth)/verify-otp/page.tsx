import { notFound } from "next/navigation";
import { getLocaleDirection } from "@/i18n/locale";
import { OtpVerificationPageView } from "@/modules/auth/components";
import { isAuthContext } from "@/modules/auth/config/auth-context";

export default async function AuthVerifyOtpPage({ params }: { params: Promise<{ locale: string; authContext: string }> }) {
  const { locale, authContext } = await params;
  if (!isAuthContext(authContext)) notFound();
  return <OtpVerificationPageView direction={getLocaleDirection(locale)} authContext={authContext} />;
}
