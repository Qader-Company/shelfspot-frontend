import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { AuthCenteredShell } from "@/modules/auth/components/auth-centered-shell";
import { VerifyEmailForm } from "@/modules/auth/components/verify-email-form";

interface VerifyEmailPageViewProps {
  direction: "rtl" | "ltr";
}

export async function VerifyEmailPageView({
  direction,
}: VerifyEmailPageViewProps) {
  const t = await getTranslations("auth.verifyEmail");

  return (
    <AuthCenteredShell
      backHref={ROUTES.register}
      backLabel={t("actions.back")}
      direction={direction}
      imageClassName="h-[157px] w-[226px]"
      visualAlt={t("visualAlt")}
      visualHeight={157}
      visualSrc="/auth/screens/verify-email.png"
      visualWidth={226}
    >
      <VerifyEmailForm />
    </AuthCenteredShell>
  );
}
