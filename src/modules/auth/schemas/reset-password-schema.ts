import { z } from "@/shared/lib/validation";

type Translate = (key: string) => string;

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export const resetPasswordDefaultValues: ResetPasswordFormValues = {
  password: "",
  confirmPassword: "",
};

export function createResetPasswordSchema(t: Translate) {
  return z
    .object({
      password: z
        .string()
        .min(1, t("validation.passwordRequired"))
        .min(8, t("validation.passwordMin")),
      confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: t("validation.passwordsMismatch"),
      path: ["confirmPassword"],
    });
}
