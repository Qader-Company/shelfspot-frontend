import { getTranslations } from "next-intl/server";

import { AuthCenteredShell } from "@/modules/auth/components/auth-centered-shell";
import { ResetPasswordForm } from "@/modules/auth/components/reset-password-form";
import { getAuthContextConfig, type AuthContext } from "@/modules/auth/config/auth-context";

interface ResetPasswordPageViewProps {
  direction: "rtl" | "ltr";
  authContext?: AuthContext;
}

export async function ResetPasswordPageView({
  direction,
  authContext = "company",
}: ResetPasswordPageViewProps) {
  const t = await getTranslations("auth.resetPassword");

  return (
    <AuthCenteredShell
      backHref={getAuthContextConfig(authContext).otpRoute}
      backLabel={t("actions.back")}
      direction={direction}
      imageClassName="h-[157px] w-[226px]"
      visualAlt={t("visualAlt")}
      visualHeight={157}
      visualSrc="/auth/screens/reset-password.svg"
      visualWidth={226}
    >
      <ResetPasswordForm authContext={authContext} />
    </AuthCenteredShell>
  );
}
