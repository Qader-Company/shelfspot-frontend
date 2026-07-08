"use client";

import { Eye } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { ROUTES } from "@/config/routes";
import { useRouter } from "@/i18n/navigation";
import { AuthPasswordIcon } from "@/modules/auth/components/auth-field-icons";
import { AuthInputField } from "@/modules/auth/components/auth-input-field";
import {
  createResetPasswordSchema,
  resetPasswordDefaultValues,
  type ResetPasswordFormValues,
} from "@/modules/auth/schemas/reset-password-schema";
import { zodResolver } from "@/shared/lib/validation";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";

function PasswordToggle({
  visible,
  onClick,
  label,
}: {
  visible: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
      aria-label={label}
    >
      {visible ? (
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
  );
}

export function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const schema = useMemo(() => createResetPasswordSchema(t), [t]);
  const form = useForm<ResetPasswordFormValues>({
    defaultValues: resetPasswordDefaultValues,
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
          <AuthInputField
            control={form.control}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            label={t("fields.password.label")}
            placeholder={t("fields.password.placeholder")}
            icon={<AuthPasswordIcon />}
            endAdornment={
              <PasswordToggle
                visible={showPassword}
                onClick={() => setShowPassword((value) => !value)}
                label={t(
                  showPassword ? "actions.hidePassword" : "actions.showPassword",
                )}
              />
            }
          />

          <AuthInputField
            control={form.control}
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            label={t("fields.confirmPassword.label")}
            placeholder={t("fields.confirmPassword.placeholder")}
            icon={<AuthPasswordIcon />}
            endAdornment={
              <PasswordToggle
                visible={showConfirmPassword}
                onClick={() => setShowConfirmPassword((value) => !value)}
                label={t(
                  showConfirmPassword
                    ? "actions.hideConfirmPassword"
                    : "actions.showConfirmPassword",
                )}
              />
            }
          />

          <div className="space-y-1 text-sm text-primary">
            <p className="text-muted-foreground">{t("states.passwordRules")}</p>
            <ul className="list-disc ps-5 text-xs leading-5 text-primary">
              <li>{t("states.passwordMin")}</li>
              <li>{t("states.passwordMatch")}</li>
            </ul>
          </div>

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
    </div>
  );
}
