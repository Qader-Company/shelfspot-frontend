import axios from "axios";

import {
  getAuthContextConfig,
  type AuthContext,
} from "@/modules/auth/config/auth-context";
import { adminApiClient, apiClient } from "@/shared/lib/api/client";

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

export async function loginService(
  payload: LoginPayload,
  context: AuthContext = "company",
) {
  const client = context === "admin" ? adminApiClient : apiClient;
  const response = await client.post<CompanyLoginResponse>(
    getAuthContextConfig(context).loginEndpoint,
    {
      email: payload.email,
      password: payload.password,
    },
    {
      headers: {
        "X-Remember-Me": String(payload.rememberMe),
      },
    },
  );

  return {
    message: response.data.message,
  } satisfies LoginResponse;
}

export async function refreshTokens(context: AuthContext) {
  await axios.post(getAuthContextConfig(context).refreshEndpoint, undefined, {
    withCredentials: true,
  });
}
