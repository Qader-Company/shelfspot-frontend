import { z } from "@/shared/lib/validation";

type Translate = (key: string) => string;

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const loginDefaultValues: LoginFormValues = {
  email: "",
  password: "",
  rememberMe: false,
};

export function createLoginSchema(t: Translate) {
  return z.object({
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    password: z.string().min(1, t("validation.passwordRequired")),
    rememberMe: z.boolean(),
  });
}
