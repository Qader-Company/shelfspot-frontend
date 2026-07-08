import type { AuthTokens } from "@/shared/lib/auth/types";
import { apiClient } from "@/shared/lib/api/client";

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  message: string;
  tokens: AuthTokens;
}

interface CompanyLoginResponse {
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
  };
}

const LOGIN_ENDPOINT = "/api/auth/company/login";

export async function loginService(payload: LoginPayload) {
  const response = await apiClient.post<CompanyLoginResponse>(LOGIN_ENDPOINT, {
    email: payload.email,
    password: payload.password,
  });

  return {
    message: response.data.message,
    tokens: {
      accessToken: response.data.data.access_token,
      refreshToken: response.data.data.refresh_token,
      tokenType: response.data.data.token_type,
    },
  } satisfies LoginResponse;
}
