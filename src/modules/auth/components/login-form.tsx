"use client";

import { Check } from "lucide-react";
import { Eye } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  AuthEmailIcon,
  AuthPasswordIcon,
} from "@/modules/auth/components/auth-field-icons";
import { AuthInputField } from "@/modules/auth/components/auth-input-field";
import { AuthModeSwitch } from "@/modules/auth/components/auth-mode-switch";
import { useLoginMutation } from "@/modules/auth/hooks/use-login-mutation";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/config/routes";
import {
  createLoginSchema,
  loginDefaultValues,
  type LoginFormValues,
} from "@/modules/auth/schemas/login-schema";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { zodResolver } from "@/shared/lib/validation";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";

interface LoginFormProps {
  showRegistrationSuccess?: boolean;
}

export function LoginForm({ showRegistrationSuccess = false }: LoginFormProps) {
  const t = useTranslations("auth.login");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const loginSchema = useMemo(() => createLoginSchema(t), [t]);
  const loginMutation = useLoginMutation();
  const form = useForm<LoginFormValues>({
    defaultValues: loginDefaultValues,
    resolver: zodResolver(loginSchema),
  });
  const rememberMe = useWatch({
    control: form.control,
    name: "rememberMe",
  });

  async function onSubmit(values: LoginFormValues) {
    form.clearErrors();

    try {
      await loginMutation.mutateAsync(values);
    } catch (error) {
      const apiError = normalizeApiError(error);

      Object.entries(apiError.fieldErrors ?? {}).forEach(([key, messages]) => {
        if (key in loginDefaultValues) {
          form.setError(key as keyof LoginFormValues, {
            message: messages[0],
          });
        }
      });

      const authErrorMessage =
        apiError.status === 401
          ? apiError.message.toLowerCase().includes("api key")
            ? t("errors.invalidApiKey")
            : t("errors.invalidCredentials")
          : apiError.status === 422
            ? t("errors.validation")
            : t("errors.generic");

      form.setError("root", {
        message: authErrorMessage,
      });
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-5 sm:gap-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-display-xs font-semibold text-foreground sm:text-display-sm lg:text-display-md">
          {t("title")}
        </h1>
        <p className="text-base font-normal text-muted-foreground sm:text-lg lg:text-xl">
          {t("description")}
        </p>
      </div>

      <div>
        <AuthModeSwitch
          active="sign-in"
          signInHref={ROUTES.login}
          signInLabel={t("tabs.signIn")}
          signUpHref={ROUTES.register}
          signUpLabel={t("tabs.signUp")}
        />
      </div>

      {showRegistrationSuccess ? (
        <p className="rounded-[18px] border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
          {t("states.registerSuccess")}
        </p>
      ) : null}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 sm:space-y-6"
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

          <AuthInputField
            control={form.control}
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="current-password"
            label={t("fields.password.label")}
            placeholder={t("fields.password.placeholder")}
            icon={<AuthPasswordIcon />}
            endAdornment={
              <button
                type="button"
                onClick={() => setIsPasswordVisible((value) => !value)}
                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
                aria-label={t(
                  isPasswordVisible
                    ? "actions.hidePassword"
                    : "actions.showPassword",
                )}
              >
                {isPasswordVisible ? (
                  <Image
                    src="/auth/icons/view-off.svg"
                    alt=""
                    aria-hidden="true"
                    width={13}
                    height={13}
                    className="size-[13px]"
                  />
                ) : (
                  <Eye className="size-[13px]" />
                )}
              </button>
            }
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm sm:gap-4">
            <label className="inline-flex items-center gap-2 text-muted-foreground">
              <button
                type="button"
                role="checkbox"
                aria-checked={rememberMe}
                onClick={() =>
                  form.setValue("rememberMe", !rememberMe, {
                    shouldDirty: true,
                  })
                }
                className={cn(
                  "flex size-4 items-center justify-center rounded-[4px] border transition-colors focus-visible:outline-none",
                  rememberMe
                    ? "border-primary bg-accent text-primary"
                    : "border-border bg-card text-transparent",
                )}
              >
                <Check className="size-3 stroke-[2.5]" />
              </button>
              <span>{t("actions.rememberMe")}</span>
            </label>

            <Link
              href={ROUTES.forgotPassword}
              className="text-sm font-medium text-primary"
            >
              {t("actions.forgotPassword")}
            </Link>
          </div>

          {form.formState.errors.root?.message ? (
            <p className="rounded-[18px] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full rounded-md text-lg leading-none font-semibold text-background sm:h-10 sm:text-xl"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending
              ? t("actions.submitting")
              : t("actions.submit")}
          </Button>
        </form>
      </Form>

      <div>
        <p className="text-center text-sm leading-6 text-muted-foreground">
          {t("states.noAccount")}{" "}
          <Link
            href={ROUTES.register}
            className={cn("font-semibold text-primary")}
          >
            {t("actions.createAccount")}
          </Link>
        </p>
      </div>
    </div>
  );
}
