import { getLocale, getTranslations } from "next-intl/server";

import { AuthSplitShell } from "@/modules/auth/components/auth-split-shell";
import { RegisterForm } from "@/modules/auth/components/register-form";

export async function RegisterPageView() {
  const t = await getTranslations("auth.register");
  const locale = await getLocale();

  return (
    <AuthSplitShell
      visualAlt={t("visualAlt")}
      visualSrc={locale === "ar" ? "/auth/screens/signup-screen-ar.png" : "/auth/screens/signup-screen.png"}
    >
      <RegisterForm />
    </AuthSplitShell>
  );
}
