import type { NextRequest } from "next/server";

import { API_CONFIG } from "@/config/api";
import { proxyAuthRequest } from "@/shared/lib/api/auth-proxy";
import {
  isTokenPayload,
  setSessionCookies,
  stripTokens,
} from "@/shared/lib/auth/session-cookies";

export async function POST(request: NextRequest) {
  const persistent = request.headers.get("x-remember-me") === "true";

  return proxyAuthRequest(request, "/auth/admin/login", {
    apiKey: API_CONFIG.adminApiKey,
    transformResponse: (body, response) => {
      if (body && typeof body === "object") {
        const data = (body as { data?: unknown }).data;
        if (isTokenPayload(data)) {
          setSessionCookies(response, data, persistent, "admin");
        }
      }

      return stripTokens(body);
    },
  });
}
