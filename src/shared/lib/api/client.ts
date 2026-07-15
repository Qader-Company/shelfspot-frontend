import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

import { API_CONFIG } from "@/config/api";
import { refreshCompanyTokens } from "@/modules/auth/services/refresh-token-service";
import { useAuthStore } from "@/shared/stores/auth-store";

export const apiClient = axios.create({
  baseURL: undefined,
  timeout: API_CONFIG.timeoutMs,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

type AuthRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  authTokenType?: "access" | "refresh";
};

let refreshPromise: Promise<
  Awaited<ReturnType<typeof refreshCompanyTokens>>
> | null = null;
let isApiClientReady = false;

function isRefreshRequest(url?: string) {
  return url?.includes("/auth/company/refresh");
}

function isPublicAuthRequest(url?: string) {
  return (
    url?.includes("/auth/company/login") ||
    url?.includes("/auth/company/register") ||
    url?.includes("/auth/company/forgot-password") ||
    url?.includes("/auth/company/email-verification") ||
    url?.includes("/auth/company/email-verification/send-otp")
  );
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const locale = window.location.pathname.split("/")[1];
  const loginPath = locale === "en" || locale === "ar" ? `/${locale}/login` : "/ar/login";

  window.location.replace(loginPath);
}

export function setupApiClient() {
  if (isApiClientReady) {
    return;
  }

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!axios.isAxiosError(error)) {
        throw error;
      }

      const config = error.config as AuthRequestConfig | undefined;
      const status = error.response?.status;

      if (
        !config ||
        config._retry ||
        status !== 401 ||
        isPublicAuthRequest(config.url) ||
        isRefreshRequest(config.url)
      ) {
        throw error;
      }

      config._retry = true;

      try {
        refreshPromise ??= refreshCompanyTokens().finally(() => {
          refreshPromise = null;
        });

        await refreshPromise;

        return apiClient(config);
      } catch (refreshError) {
        useAuthStore.getState().clearSession();
        redirectToLogin();
        throw refreshError;
      }
    },
  );

  isApiClientReady = true;
}
