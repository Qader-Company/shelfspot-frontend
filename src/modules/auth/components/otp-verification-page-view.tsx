import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { AuthCenteredShell } from "@/modules/auth/components/auth-centered-shell";
import { OtpVerificationForm } from "@/modules/auth/components/otp-verification-form";

interface OtpVerificationPageViewProps {
  direction: "rtl" | "ltr";
}

export async function OtpVerificationPageView({
  direction,
}: OtpVerificationPageViewProps) {
  const t = await getTranslations("auth.otpVerification");

  return (
    <AuthCenteredShell
      backHref={ROUTES.forgotPassword}
      backLabel={t("actions.back")}
      direction={direction}
      imageClassName="h-[157px] w-[226px]"
      visualAlt={t("visualAlt")}
      visualHeight={157}
      visualSrc="/auth/screens/otp-verify.png"
      visualWidth={226}
    >
      <OtpVerificationForm />
    </AuthCenteredShell>
  );
}
