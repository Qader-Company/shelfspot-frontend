import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { AuthCenteredShell } from "@/modules/auth/components/auth-centered-shell";
import { ResetPasswordForm } from "@/modules/auth/components/reset-password-form";

interface ResetPasswordPageViewProps {
  direction: "rtl" | "ltr";
}

export async function ResetPasswordPageView({
  direction,
}: ResetPasswordPageViewProps) {
  const t = await getTranslations("auth.resetPassword");

  return (
    <AuthCenteredShell
      backHref={ROUTES.otpVerification}
      backLabel={t("actions.back")}
      direction={direction}
      imageClassName="h-[157px] w-[226px]"
      visualAlt={t("visualAlt")}
      visualHeight={157}
      visualSrc="/auth/screens/reset-password.svg"
      visualWidth={226}
    >
      <ResetPasswordForm />
    </AuthCenteredShell>
  );
}
