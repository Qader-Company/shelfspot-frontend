import { z } from "@/shared/lib/validation";

type Translate = (key: string) => string;

export interface RegisterFormValues {
  companyName: string;
  crNumber: string;
  email: string;
  phoneNumber: string;
  password: string;
  passwordConfirmation: string;
  industry: string;
}

export const registerDefaultValues: RegisterFormValues = {
  companyName: "",
  crNumber: "",
  email: "",
  phoneNumber: "",
  password: "",
  passwordConfirmation: "",
  industry: "",
};

export function createRegisterSchema(t: Translate) {
  return z
    .object({
      companyName: z
        .string()
        .trim()
        .min(1, t("validation.companyNameRequired")),
      crNumber: z
        .string()
        .trim()
        .min(1, t("validation.crNumberRequired"))
        .regex(/^\d{10}$/, t("validation.crNumberInvalid")),
      email: z
        .string()
        .trim()
        .min(1, t("validation.emailRequired"))
        .email(t("validation.emailInvalid")),
      phoneNumber: z
        .string()
        .trim()
        .min(1, t("validation.phoneNumberRequired"))
        .regex(/^[+\d][\d\s-]{7,}$/, t("validation.phoneNumberInvalid")),
      password: z
        .string()
        .min(1, t("validation.passwordRequired"))
        .min(8, t("validation.passwordMin")),
      passwordConfirmation: z
        .string()
        .min(1, t("validation.passwordConfirmationRequired")),
      industry: z.string().trim().min(1, t("validation.industryRequired")),
    })
    .refine((values) => values.password === values.passwordConfirmation, {
      message: t("validation.passwordConfirmationMismatch"),
      path: ["passwordConfirmation"],
    });
}
