"use client";

import { Eye } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { ROUTES } from "@/config/routes";
import { useRouter } from "@/i18n/navigation";
import {
  AuthChevronDownIcon,
  AuthCompanyIcon,
  AuthCrIcon,
  AuthEmailIcon,
  AuthIndustryIcon,
  AuthPasswordIcon,
  AuthPhoneIcon,
} from "@/modules/auth/components/auth-field-icons";
import { AuthInputField } from "@/modules/auth/components/auth-input-field";
import { AuthModeSwitch } from "@/modules/auth/components/auth-mode-switch";
import { AuthSelectField } from "@/modules/auth/components/auth-select-field";
import { useRegisterMutation } from "@/modules/auth/hooks/use-register-mutation";
import {
  createRegisterSchema,
  registerDefaultValues,
  type RegisterFormValues,
} from "@/modules/auth/schemas/register-schema";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { zodResolver } from "@/shared/lib/validation";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const registerSchema = useMemo(() => createRegisterSchema(t), [t]);
  const registerMutation = useRegisterMutation();
  const [successMessage, setSuccessMessage] = useState("");
  const form = useForm<RegisterFormValues>({
    defaultValues: registerDefaultValues,
    resolver: zodResolver(registerSchema),
  });

  const industryOptions = useMemo(
    () => [
      { label: t("industryOptions.logistics"), value: "logistics" },
      { label: t("industryOptions.retail"), value: "retail" },
      { label: t("industryOptions.tech"), value: "tech" },
    ],
    [t],
  );

  async function onSubmit(values: RegisterFormValues) {
    form.clearErrors();
    setSuccessMessage("");

    try {
      const response = await registerMutation.mutateAsync(values);

      setSuccessMessage(response.message || t("states.success"));

      window.setTimeout(() => {
        router.replace(`${ROUTES.login}?registered=1`);
      }, 800);
    } catch (error) {
      const apiError = normalizeApiError(error);

      Object.entries(apiError.fieldErrors ?? {}).forEach(([key, messages]) => {
        const fieldMap: Partial<Record<string, keyof RegisterFormValues>> = {
          company_name: "companyName",
          cr_number: "crNumber",
          email: "email",
          phone_number: "phoneNumber",
          password: "password",
          industry: "industry",
        };

        const fieldName = fieldMap[key] ?? (key as keyof RegisterFormValues);

        if (fieldName in registerDefaultValues) {
          form.setError(fieldName, {
            message: messages[0],
          });
        }
      });

      const registerErrorMessage =
        apiError.status === 401
          ? apiError.message.toLowerCase().includes("api key")
            ? t("errors.invalidApiKey")
            : t("errors.unauthorized")
          : apiError.status === 409
            ? t("errors.duplicateAccount")
            : apiError.status === 422
              ? t("errors.validation")
              : t("errors.generic");

      form.setError("root", {
        message: registerErrorMessage,
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
          active="sign-up"
          signInHref={ROUTES.login}
          signInLabel={t("tabs.signIn")}
          signUpHref={ROUTES.register}
          signUpLabel={t("tabs.signUp")}
        />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 sm:space-y-6"
          noValidate
        >
          <AuthInputField
            control={form.control}
            name="companyName"
            autoComplete="organization"
            label={t("fields.companyName.label")}
            placeholder={t("fields.companyName.placeholder")}
            icon={<AuthCompanyIcon />}
          />

          <AuthInputField
            control={form.control}
            name="crNumber"
            inputMode="numeric"
            autoComplete="off"
            label={t("fields.crNumber.label")}
            placeholder={t("fields.crNumber.placeholder")}
            icon={<AuthCrIcon />}
          />

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
            name="phoneNumber"
            type="tel"
            autoComplete="tel"
            label={t("fields.phoneNumber.label")}
            placeholder={t("fields.phoneNumber.placeholder")}
            icon={<AuthPhoneIcon />}
          />

          <AuthInputField
            control={form.control}
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="new-password"
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

          <div className="relative">
            <AuthSelectField
              control={form.control}
              name="industry"
              label={t("fields.industry.label")}
              placeholder={t("fields.industry.placeholder")}
              options={industryOptions}
              icon={<AuthIndustryIcon />}
            />
            <span className="pointer-events-none absolute inset-y-0 end-3 top-7 flex items-center text-muted-foreground">
              <AuthChevronDownIcon />
            </span>
          </div>

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
            className="h-11 w-full rounded-md text-lg leading-none font-semibold text-background sm:h-10 sm:text-xl"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending
              ? t("actions.submitting")
              : t("actions.submit")}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm leading-6 text-muted-foreground">
        {t("states.termsPrefix")}{" "}
        <span className={cn("font-medium text-primary")}>
          {t("states.termsOfService")}
        </span>{" "}
        {t("states.and")}{" "}
        <span className={cn("font-medium text-primary")}>
          {t("states.privacyPolicy")}
        </span>
      </p>
    </div>
  );
}
