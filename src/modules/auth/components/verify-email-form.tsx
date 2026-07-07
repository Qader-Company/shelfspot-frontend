"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { ROUTES } from "@/config/routes";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthOtpField } from "@/modules/auth/components/auth-otp-field";
import {
  createOtpVerificationSchema,
  otpVerificationDefaultValues,
  type OtpVerificationFormValues,
} from "@/modules/auth/schemas/otp-verification-schema";
import { zodResolver } from "@/shared/lib/validation";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";

export function VerifyEmailForm() {
  const t = useTranslations("auth.verifyEmail");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const schema = useMemo(() => createOtpVerificationSchema(t), [t]);
  const form = useForm<OtpVerificationFormValues>({
    defaultValues: otpVerificationDefaultValues,
    resolver: zodResolver(schema),
  });

  async function onSubmit() {
    setIsSubmitting(true);
    router.push(ROUTES.login);
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

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full rounded-md text-lg leading-none font-semibold text-background sm:text-xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("actions.submitting") : t("actions.submit")}
          </Button>
        </form>
      </Form>

      <p className="text-center text-xs font-medium text-primary">
        <Link href={ROUTES.verifyEmail}>{t("actions.resendCode")}</Link>
      </p>
    </div>
  );
}
