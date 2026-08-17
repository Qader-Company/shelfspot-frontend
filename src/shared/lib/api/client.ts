import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

import { API_CONFIG } from "@/config/api";
import { refreshTokens } from "@/modules/auth/services/session-api";
import { getAuthContextConfig, type AuthContext } from "@/modules/auth/config/auth-context";

export const apiClient = axios.create({
  baseURL: undefined,
  timeout: API_CONFIG.timeoutMs,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
export const adminApiClient = axios.create({
  baseURL: undefined,
  timeout: API_CONFIG.timeoutMs,
  withCredentials: true,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

type AuthRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  authTokenType?: "access" | "refresh";
};

const refreshPromises: Partial<Record<AuthContext, Promise<void>>> = {};
const readyContexts = new Set<AuthContext>();

function redirectToLogin(context: AuthContext) {
  if (typeof window === "undefined") return;
  const locale = window.location.pathname.split("/")[1];
  const route = getAuthContextConfig(context).loginRoute;
  const loginPath = locale === "en" || locale === "ar" ? `/${locale}${route}` : `/ar${route}`;

  window.location.replace(loginPath);
}

function setupClient(context: AuthContext) {
  if (readyContexts.has(context)) return;
  const client = context === "admin" ? adminApiClient : apiClient;
  client.interceptors.response.use(
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
        config.url?.startsWith("/api/auth/")
      ) {
        throw error;
      }

      config._retry = true;

      try {
        refreshPromises[context] ??= refreshTokens(context).finally(() => {
          delete refreshPromises[context];
        });
        await refreshPromises[context];
        return client(config);
      } catch (refreshError) {
        await fetch(getAuthContextConfig(context).logoutEndpoint, {
          method: "POST",
          credentials: "include",
        }).catch(() => undefined);
        redirectToLogin(context);
        throw refreshError;
      }
    },
  );

  readyContexts.add(context);
}

export function setupApiClient() { setupClient("company"); setupClient("admin"); }
