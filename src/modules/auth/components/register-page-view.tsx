import { getTranslations } from "next-intl/server";

import { AuthSplitShell } from "@/modules/auth/components/auth-split-shell";
import { RegisterForm } from "@/modules/auth/components/register-form";

export async function RegisterPageView() {
  const t = await getTranslations("auth.register");

  return (
    <AuthSplitShell
      visualAlt={t("visualAlt")}
      visualSrc="/auth/screens/signup-screen.png"
    >
      <RegisterForm />
    </AuthSplitShell>
  );
}
