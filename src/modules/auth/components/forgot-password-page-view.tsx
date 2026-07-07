import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { AuthCenteredShell } from "@/modules/auth/components/auth-centered-shell";
import { ForgotPasswordForm } from "@/modules/auth/components/forgot-password-form";

interface ForgotPasswordPageViewProps {
  direction: "rtl" | "ltr";
}

export async function ForgotPasswordPageView({
  direction,
}: ForgotPasswordPageViewProps) {
  const t = await getTranslations("auth.forgotPassword");

  return (
    <AuthCenteredShell
      backHref={ROUTES.login}
      backLabel={t("actions.back")}
      direction={direction}
      imageClassName="h-[157px] w-[226px]"
      visualAlt={t("visualAlt")}
      visualHeight={157}
      visualSrc="/auth/screens/forgot-password.svg"
      visualWidth={226}
    >
      <ForgotPasswordForm />
    </AuthCenteredShell>
  );
}
