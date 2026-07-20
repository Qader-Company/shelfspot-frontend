import { getTranslations } from "next-intl/server";

import { AuthCenteredShell } from "@/modules/auth/components/auth-centered-shell";
import { ForgotPasswordForm } from "@/modules/auth/components/forgot-password-form";
import { getAuthContextConfig, type AuthContext } from "@/modules/auth/config/auth-context";

interface ForgotPasswordPageViewProps {
  direction: "rtl" | "ltr";
  authContext?: AuthContext;
}

export async function ForgotPasswordPageView({
  direction,
  authContext = "company",
}: ForgotPasswordPageViewProps) {
  const t = await getTranslations("auth.forgotPassword");

  return (
    <AuthCenteredShell
      backHref={getAuthContextConfig(authContext).loginRoute}
      backLabel={t("actions.back")}
      direction={direction}
      imageClassName="h-[157px] w-[226px]"
      visualAlt={t("visualAlt")}
      visualHeight={157}
      visualSrc="/auth/screens/forgot-password.svg"
      visualWidth={226}
    >
      <ForgotPasswordForm authContext={authContext} />
    </AuthCenteredShell>
  );
}
