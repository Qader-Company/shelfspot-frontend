import { z } from "@/shared/lib/validation";

type Translate = (key: string) => string;

export interface ForgotPasswordFormValues {
  email: string;
}

export const forgotPasswordDefaultValues: ForgotPasswordFormValues = {
  email: "",
};

export function createForgotPasswordSchema(t: Translate) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
  });
}
