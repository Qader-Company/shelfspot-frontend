import { apiClient } from "@/shared/lib/api/client";

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  message: string;
}

interface CompanyLoginResponse {
  message: string;
}

const LOGIN_ENDPOINT = "/api/auth/company/login";

export async function loginService(payload: LoginPayload) {
  const response = await apiClient.post<CompanyLoginResponse>(LOGIN_ENDPOINT, {
    email: payload.email,
    password: payload.password,
  }, {
    headers: {
      "X-Remember-Me": String(payload.rememberMe),
    },
  });

  return {
    message: response.data.message,
  } satisfies LoginResponse;
}
