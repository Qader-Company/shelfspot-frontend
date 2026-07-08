import { apiClient } from "@/shared/lib/api/client";

export interface ResendVerificationOtpPayload {
  token: string;
}

export interface ResendVerificationOtpResponse {
  message: string;
}

interface ResendVerificationOtpApiResponse {
  message: string;
}

const RESEND_VERIFICATION_OTP_ENDPOINT =
  "/api/auth/company/email-verification/send-otp";

export async function resendVerificationOtpService(
  payload: ResendVerificationOtpPayload,
) {
  const response = await apiClient.post<ResendVerificationOtpApiResponse>(
    RESEND_VERIFICATION_OTP_ENDPOINT,
    undefined,
    {
      headers: {
        Authorization: `Bearer ${payload.token}`,
      },
    },
  );

  return {
    message: response.data.message,
  } satisfies ResendVerificationOtpResponse;
}
