import { apiClient } from "@/shared/lib/api/client";

export interface VerifyEmailPayload {
  otp: string;
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: unknown | null;
}

interface VerifyEmailApiResponse {
  message: string;
  data: {
    user: unknown | null;
  };
}

const VERIFY_EMAIL_ENDPOINT = "/api/auth/company/email-verification";

export async function verifyEmailService(payload: VerifyEmailPayload) {
  const body = new URLSearchParams({
    otp: payload.otp,
  });

  const response = await apiClient.patch<VerifyEmailApiResponse>(
    VERIFY_EMAIL_ENDPOINT,
    body,
    {
      headers: {
        Authorization: `Bearer ${payload.token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return {
    message: response.data.message,
    user: response.data.data.user,
  } satisfies VerifyEmailResponse;
}
