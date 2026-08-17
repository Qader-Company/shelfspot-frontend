import type { NextRequest } from "next/server";

import { API_CONFIG } from "@/config/api";
import { proxyAuthRequest } from "@/shared/lib/api/auth-proxy";
import {
  isTokenPayload,
  setSessionCookies,
  stripTokens,
} from "@/shared/lib/auth/session-cookies";

export async function PATCH(request: NextRequest) {
  return proxyAuthRequest(request, "/auth/company/email-verification", {
    apiKey: API_CONFIG.companyApiKey,
    transformResponse: (body, response) => {
      if (body && typeof body === "object") {
        const data = (body as { data?: unknown }).data;
        if (isTokenPayload(data)) setSessionCookies(response, data, true);
      }

      return stripTokens(body);
    },
  });
}
