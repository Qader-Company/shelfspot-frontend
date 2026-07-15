import type { NextRequest } from "next/server";

import { proxyAuthRequest } from "@/shared/lib/api/auth-proxy";
import {
  REFRESH_TOKEN_COOKIE,
  PERSISTENT_SESSION_COOKIE,
  isTokenPayload,
  setSessionCookies,
  stripTokens,
} from "@/shared/lib/auth/session-cookies";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return Response.json({ message: "Missing refresh token." }, { status: 401 });
  }

  return proxyAuthRequest(request, "/auth/company/refresh", {
    authorization: `Bearer ${refreshToken}`,
    transformResponse: (body, response) => {
      if (body && typeof body === "object") {
        const data = (body as { data?: unknown }).data;
        if (isTokenPayload(data)) {
          const persistent =
            request.cookies.get(PERSISTENT_SESSION_COOKIE)?.value === "true";
          setSessionCookies(response, data, persistent);
        }
      }

      return stripTokens(body);
    },
  });
}
