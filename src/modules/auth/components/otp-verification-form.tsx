"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { useRouter } from "@/i18n/navigation";
import { AuthOtpField } from "@/modules/auth/components/auth-otp-field";
import {
  createOtpVerificationSchema,
  otpVerificationDefaultValues,
  type OtpVerificationFormValues,
} from "@/modules/auth/schemas/otp-verification-schema";
import { zodResolver } from "@/shared/lib/validation";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { getAuthContextConfig, type AuthContext } from "@/modules/auth/config/auth-context";
import { readPasswordResetToken, verifyPasswordResetOtp } from "@/modules/auth/services/password-reset-service";
import { getPasswordResetState, setPasswordResetState } from "@/shared/lib/auth/password-reset-storage";
import { normalizeApiError } from "@/shared/lib/api/errors";

export function OtpVerificationForm({ authContext = "company" }: { authContext?: AuthContext }) {
  const t = useTranslations("auth.otpVerification");
  const router = useRouter();
  const authConfig = getAuthContextConfig(authContext);
  const schema = useMemo(() => createOtpVerificationSchema(t), [t]);
  const form = useForm<OtpVerificationFormValues>({
    defaultValues: otpVerificationDefaultValues,
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: OtpVerificationFormValues) {
    form.clearErrors();
    const state = getPasswordResetState(authContext);
    if (!state?.email) { form.setError("root", { message: t("errors.missingEmail") }); return; }
    try {
      const response = await verifyPasswordResetOtp(authContext, { email: state.email, code: values.code });
      const token = readPasswordResetToken(response);
      if (!token) { form.setError("root", { message: t("errors.missingToken") }); return; }
      setPasswordResetState(authContext, { email: state.email, token });
      router.push(authConfig.resetPasswordRoute);
    } catch (error) {
      const apiError = normalizeApiError(error);
      form.setError("root", { message: apiError.status === 422 ? t("errors.invalidCode") : t("errors.generic") });
    }
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="space-y-1.5 text-center">
        <h1 className="text-display-md text-center font-semibold text-foreground">
          {t("title")}
        </h1>
        <p className="text-base font-normal text-muted-foreground sm:text-lg">
          {t("description")}
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <AuthOtpField control={form.control} digitLabel={(position) => t("digitLabel", { position })} />

          {form.formState.errors.root?.message ? <p className="rounded-[18px] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{form.formState.errors.root.message}</p> : null}

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full rounded-md text-lg leading-none font-semibold text-background sm:text-xl"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? t("actions.submitting") : t("actions.submit")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
