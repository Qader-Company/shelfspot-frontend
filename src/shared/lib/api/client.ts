import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

import { API_CONFIG } from "@/config/api";
import { refreshCompanyTokens } from "@/modules/auth/services/refresh-token-service";
import { getStoredAccessToken } from "@/shared/lib/auth/token-storage";
import { useAuthStore } from "@/shared/stores/auth-store";

export const apiClient = axios.create({
  baseURL: API_CONFIG.browserBaseUrl || undefined,
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
  return url?.includes("/auth/company/login");
}

export function setupApiClient() {
  if (isApiClientReady) {
    return;
  }

  apiClient.interceptors.request.use((config: AuthRequestConfig) => {
    config.headers.set("Accept", "application/json");
    config.headers.set("X-Authorization", API_CONFIG.browserApiKey);

    if (!isPublicAuthRequest(config.url)) {
      const accessToken = getStoredAccessToken();

      if (accessToken) {
        config.headers.set("Authorization", `Bearer ${accessToken}`);
      }
    }

    return config;
  });

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

        const tokens = await refreshPromise;

        useAuthStore.getState().updateTokens(tokens);

        config.headers.set("Authorization", `Bearer ${tokens.accessToken}`);

        return apiClient(config);
      } catch (refreshError) {
        useAuthStore.getState().clearSession();
        throw refreshError;
      }
    },
  );

  isApiClientReady = true;
}
