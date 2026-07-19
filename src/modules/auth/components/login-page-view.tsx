import { getTranslations } from "next-intl/server";

import { AuthSplitShell } from "@/modules/auth/components/auth-split-shell";
import { LoginForm } from "@/modules/auth/components/login-form";
import { AuthLoginShell } from "@/modules/auth/components/auth-login-shell";
import type { AuthContext } from "@/modules/auth/config/auth-context";

interface LoginPageViewProps {
  showRegistrationSuccess?: boolean;
  authContext?: AuthContext;
}

export async function LoginPageView({
  showRegistrationSuccess = false,
  authContext = "company",
}: LoginPageViewProps) {
  const t = await getTranslations("auth.login");

  if (authContext === "admin") {
    const adminT = await getTranslations("auth.adminLogin");
    return <AuthLoginShell><LoginForm authContext="admin" heading={adminT("title")} description={adminT("description")} /></AuthLoginShell>;
  }
  return (
    <AuthSplitShell
      visualAlt={t("visualAlt")}
      visualSrc="/auth/screens/login-screen.png"
    >
      <LoginForm showRegistrationSuccess={showRegistrationSuccess} authContext="company" />
    </AuthSplitShell>
  );
}
