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
const ADMIN_LOGIN_ENDPOINT = "/api/auth/admin/login";

export type AuthContext = "company" | "admin";

export async function loginService(
  payload: LoginPayload,
  authContext: AuthContext = "company",
) {
  const endpoint =
    authContext === "admin" ? ADMIN_LOGIN_ENDPOINT : LOGIN_ENDPOINT;
  const response = await apiClient.post<CompanyLoginResponse>(endpoint, {
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
