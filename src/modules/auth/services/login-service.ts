import { apiClient } from "@/shared/lib/api/client";

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  message?: string;
  user?: unknown | null;
}

const LOGIN_ENDPOINT = "/auth/login";

export async function loginService(payload: LoginPayload) {
  const response = await apiClient.post<LoginResponse>(LOGIN_ENDPOINT, payload);

  return response.data;
}
