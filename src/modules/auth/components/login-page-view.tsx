import { getLocale, getTranslations } from "next-intl/server";

import { AuthSplitShell } from "@/modules/auth/components/auth-split-shell";
import { LoginForm } from "@/modules/auth/components/login-form";
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
  const locale = await getLocale();

  if (authContext === "admin") {
    const adminT = await getTranslations("auth.adminLogin");
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12 sm:px-6">
        <div className="w-full max-w-[580px]">
          <LoginForm
            authContext="admin"
            heading={adminT("title")}
            description={adminT("description")}
          />
        </div>
      </main>
    );
  }
  return (
    <AuthSplitShell
      visualAlt={t("visualAlt")}
      visualSrc={locale === "ar" ? "/auth/screens/login-screen-ar.png" : "/auth/screens/login-screen.png"}
    >
      <LoginForm showRegistrationSuccess={showRegistrationSuccess} authContext="company" />
    </AuthSplitShell>
  );
}
