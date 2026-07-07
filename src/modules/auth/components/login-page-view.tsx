import { getTranslations } from "next-intl/server";

import { AuthSplitShell } from "@/modules/auth/components/auth-split-shell";
import { LoginForm } from "@/modules/auth/components/login-form";

export async function LoginPageView() {
  const t = await getTranslations("auth.login");

  return (
    <AuthSplitShell
      visualAlt={t("visualAlt")}
      visualSrc="/auth/screens/login-screen.png"
    >
      <LoginForm />
    </AuthSplitShell>
  );
}
