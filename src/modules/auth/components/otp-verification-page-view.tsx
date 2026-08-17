import { getTranslations } from "next-intl/server";

import { AuthCenteredShell } from "@/modules/auth/components/auth-centered-shell";
import { OtpVerificationForm } from "@/modules/auth/components/otp-verification-form";
import { getAuthContextConfig, type AuthContext } from "@/modules/auth/config/auth-context";

interface OtpVerificationPageViewProps {
  direction: "rtl" | "ltr";
  authContext?: AuthContext;
}

export async function OtpVerificationPageView({
  direction,
  authContext = "company",
}: OtpVerificationPageViewProps) {
  const t = await getTranslations("auth.otpVerification");

  return (
    <AuthCenteredShell
      backHref={getAuthContextConfig(authContext).forgotPasswordRoute}
      backLabel={t("actions.back")}
      direction={direction}
      imageClassName="h-[157px] w-[226px]"
      visualAlt={t("visualAlt")}
      visualHeight={157}
      visualSrc="/auth/screens/otp-verify.png"
      visualWidth={226}
    >
      <OtpVerificationForm authContext={authContext} />
    </AuthCenteredShell>
  );
}
