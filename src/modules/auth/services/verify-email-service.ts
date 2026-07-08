import type { AuthTokens } from "@/shared/lib/auth/types";
import { apiClient } from "@/shared/lib/api/client";

export interface VerifyEmailPayload {
  otp: string;
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  tokens: AuthTokens;
  user: unknown | null;
}

interface VerifyEmailApiResponse {
  message: string;
  data: {
    access_token: {
      token: string;
      ttl: number;
    };
    refresh_token: {
      token: string;
      ttl: number;
    };
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
    tokens: {
      accessToken: response.data.data.access_token.token,
      refreshToken: response.data.data.refresh_token.token,
      tokenType: "Bearer",
    },
    user: response.data.data.user,
  } satisfies VerifyEmailResponse;
}
