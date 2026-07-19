"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useRouter } from "@/i18n/navigation";
import { AuthEmailIcon } from "@/modules/auth/components/auth-field-icons";
import { AuthInputField } from "@/modules/auth/components/auth-input-field";
import { useForgotPasswordMutation } from "@/modules/auth/hooks/use-forgot-password-mutation";
import {
  createForgotPasswordSchema,
  forgotPasswordDefaultValues,
  type ForgotPasswordFormValues,
} from "@/modules/auth/schemas/forgot-password-schema";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { zodResolver } from "@/shared/lib/validation";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { getAuthContextConfig, type AuthContext } from "@/modules/auth/config/auth-context";
import { setPasswordResetState } from "@/shared/lib/auth/password-reset-storage";

export function ForgotPasswordForm({ authContext = "company" }: { authContext?: AuthContext }) {
  const t = useTranslations("auth.forgotPassword");
  const router = useRouter();
  const forgotPasswordSchema = useMemo(
    () => createForgotPasswordSchema(t),
    [t],
  );
  const forgotPasswordMutation = useForgotPasswordMutation(authContext);
  const authConfig = getAuthContextConfig(authContext);
  const [successMessage, setSuccessMessage] = useState("");
  const form = useForm<ForgotPasswordFormValues>({
    defaultValues: forgotPasswordDefaultValues,
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    form.clearErrors();
    setSuccessMessage("");

    try {
      await forgotPasswordMutation.mutateAsync(values);
      setPasswordResetState(authContext, { email: values.email });
      setSuccessMessage(t("states.success"));
      router.push(authConfig.otpRoute);
    } catch (error) {
      const apiError = normalizeApiError(error);

      Object.entries(apiError.fieldErrors ?? {}).forEach(([key, messages]) => {
        if (key in forgotPasswordDefaultValues) {
          form.setError(key as keyof ForgotPasswordFormValues, {
            message: messages[0],
          });
        }
      });

      const forgotPasswordErrorMessage =
        apiError.status === 401
          ? apiError.message.toLowerCase().includes("api key")
            ? t("errors.invalidApiKey")
            : t("errors.unauthorized")
          : apiError.status === 404
            ? t("errors.emailNotFound")
            : apiError.status === 422
              ? t("errors.validation")
              : t("errors.generic");

      form.setError("root", {
        message: forgotPasswordErrorMessage,
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
          <AuthInputField
            control={form.control}
            name="email"
            type="email"
            autoComplete="email"
            label={t("fields.email.label")}
            placeholder={t("fields.email.placeholder")}
            icon={<AuthEmailIcon />}
          />

          {form.formState.errors.root?.message ? (
            <p className="rounded-[18px] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-[18px] border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
              {successMessage}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full rounded-md text-lg leading-none font-semibold text-background sm:text-xl"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending
              ? t("actions.submitting")
              : t("actions.submit")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
