"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { ROUTES } from "@/config/routes";
import { useRouter } from "@/i18n/navigation";
import {
  useResendVerificationOtpMutation,
  useVerifyEmailMutation,
} from "@/modules/auth/hooks/use-auth-mutations";
import { AuthOtpField } from "@/modules/auth/components/auth-otp-field";
import {
  createOtpVerificationSchema,
  otpVerificationDefaultValues,
  type OtpVerificationFormValues,
} from "@/modules/auth/schemas/otp-verification-schema";
import { getStoredVerificationToken } from "@/shared/lib/auth/verification-storage";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { zodResolver } from "@/shared/lib/validation";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";

export function VerifyEmailForm() {
  const t = useTranslations("auth.verifyEmail");
  const router = useRouter();
  const verifyEmailMutation = useVerifyEmailMutation();
  const resendOtpMutation = useResendVerificationOtpMutation();
  const [resendMessage, setResendMessage] = useState("");
  const schema = useMemo(() => createOtpVerificationSchema(t), [t]);
  const form = useForm<OtpVerificationFormValues>({
    defaultValues: otpVerificationDefaultValues,
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: OtpVerificationFormValues) {
    form.clearErrors();
    setResendMessage("");

    const verificationToken = getStoredVerificationToken();

    if (!verificationToken) {
      form.setError("root", {
        message: t("errors.missingToken"),
      });
      return;
    }

    try {
      await verifyEmailMutation.mutateAsync({
        otp: values.code,
        token: verificationToken,
      });
      router.replace(ROUTES.home);
    } catch (error) {
      const apiError = normalizeApiError(error);

      form.setError("root", {
        message: apiError.message || t("errors.generic"),
      });
    }
  }

  async function handleResendCode() {
    setResendMessage("");
    const verificationToken = getStoredVerificationToken();

    if (!verificationToken) {
      form.setError("root", {
        message: t("errors.missingToken"),
      });
      return;
    }

    try {
      const response = await resendOtpMutation.mutateAsync({
        token: verificationToken,
      });
      setResendMessage(response.message);
    } catch (error) {
      const apiError = normalizeApiError(error);
      form.setError("root", {
        message: apiError.message || t("errors.generic"),
      });
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
          <AuthOtpField control={form.control} />

          {form.formState.errors.root?.message ? (
            <p className="rounded-[18px] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          ) : null}

          {resendMessage ? (
            <p className="rounded-[18px] border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
              {resendMessage}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full rounded-md text-lg leading-none font-semibold text-background sm:text-xl"
            disabled={verifyEmailMutation.isPending}
          >
            {verifyEmailMutation.isPending
              ? t("actions.submitting")
              : t("actions.submit")}
          </Button>
        </form>
      </Form>

      <p className="text-center text-xs font-medium text-primary">
        <button
          type="button"
          onClick={handleResendCode}
          className="transition-opacity hover:opacity-80"
          disabled={resendOtpMutation.isPending}
        >
          {resendOtpMutation.isPending
            ? t("actions.resending")
            : t("actions.resendCode")}
        </button>
      </p>
    </div>
  );
}
