import { z } from "@/shared/lib/validation";

type Translate = (key: string) => string;

export interface OtpVerificationFormValues {
  code: string;
}

export const otpVerificationDefaultValues: OtpVerificationFormValues = {
  code: "",
};

export function createOtpVerificationSchema(t: Translate) {
  return z.object({
    code: z
      .string()
      .trim()
      .min(1, t("validation.codeRequired"))
      .regex(/^\d{6}$/, t("validation.codeInvalid")),
  });
}
