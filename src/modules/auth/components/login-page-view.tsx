import { getTranslations } from "next-intl/server";

import { AuthSplitShell } from "@/modules/auth/components/auth-split-shell";
import { LoginForm } from "@/modules/auth/components/login-form";

interface LoginPageViewProps {
  showRegistrationSuccess?: boolean;
}

export async function LoginPageView({
  showRegistrationSuccess = false,
}: LoginPageViewProps) {
  const t = await getTranslations("auth.login");

  return (
    <AuthSplitShell
      visualAlt={t("visualAlt")}
      visualSrc="/auth/screens/login-screen.png"
    >
      <LoginForm showRegistrationSuccess={showRegistrationSuccess} />
    </AuthSplitShell>
  );
}
