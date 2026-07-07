import axios from "axios";

import { API_CONFIG } from "@/config/api";
import type { AuthTokens } from "@/shared/lib/auth/types";
import {
  getStoredRefreshToken,
  replaceStoredAuthTokens,
} from "@/shared/lib/auth/token-storage";

interface RefreshTokenResponse {
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
  };
  message: string;
}

const REFRESH_ENDPOINT = "/auth/company/refresh";

export async function refreshCompanyTokens() {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    throw new Error("Missing refresh token.");
  }

  const response = await axios.post<RefreshTokenResponse>(
    `${API_CONFIG.browserBaseUrl}${REFRESH_ENDPOINT}`,
    undefined,
    {
      timeout: API_CONFIG.timeoutMs,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${refreshToken}`,
        "X-Authorization": API_CONFIG.browserApiKey,
      },
    },
  );

  const tokens: AuthTokens = {
    accessToken: response.data.data.access_token,
    refreshToken: response.data.data.refresh_token,
    tokenType: response.data.data.token_type,
  };

  replaceStoredAuthTokens(tokens);

  return tokens;
}
