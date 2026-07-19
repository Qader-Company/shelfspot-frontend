import { apiClient, adminApiClient } from "@/shared/lib/api/client";
import { getAuthContextConfig, type AuthContext } from "@/modules/auth/config/auth-context";

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

interface CompanyForgotPasswordResponse {
  message: string;
}

export async function forgotPasswordService(payload: ForgotPasswordPayload, context: AuthContext = "company") {
  const client = context === "admin" ? adminApiClient : apiClient;
  const response = await client.post<CompanyForgotPasswordResponse>(
    getAuthContextConfig(context).forgotPasswordEndpoint,
    {
      email: payload.email,
    },
  );

  return {
    message: response.data.message,
  } satisfies ForgotPasswordResponse;
}
