import axios from "axios";

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

const REFRESH_ENDPOINT = "/api/auth/company/refresh";

export async function refreshCompanyTokens() {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    throw new Error("Missing refresh token.");
  }

  const response = await axios.post<RefreshTokenResponse>(
    REFRESH_ENDPOINT,
    undefined,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${refreshToken}`,
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
