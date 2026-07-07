import { apiClient } from "@/shared/lib/api/client";

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

interface CompanyForgotPasswordResponse {
  message: string;
}

const FORGOT_PASSWORD_ENDPOINT = "/auth/company/forgot-password";

export async function forgotPasswordService(payload: ForgotPasswordPayload) {
  const response = await apiClient.post<CompanyForgotPasswordResponse>(
    FORGOT_PASSWORD_ENDPOINT,
    {
      email: payload.email,
    },
  );

  return {
    message: response.data.message,
  } satisfies ForgotPasswordResponse;
}
