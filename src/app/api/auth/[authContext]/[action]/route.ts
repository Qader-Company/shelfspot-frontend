import type { NextRequest } from "next/server";

import { AUTH_UPSTREAM_ENDPOINTS, isAuthAction, isAuthContext } from "@/modules/auth/config/auth-context";
import { proxyAuthRequest } from "@/shared/lib/api/auth-proxy";
import {
  ACCESS_TOKEN_COOKIE,
  AUTH_CONTEXT_COOKIE,
  PERSISTENT_SESSION_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearSessionCookies,
  isTokenPayload,
  setSessionCookies,
  stripTokens,
} from "@/shared/lib/auth/session-cookies";

type RouteParams = { authContext: string; action: string };

export async function POST(request: NextRequest, { params }: { params: Promise<RouteParams> }) {
  const { authContext, action } = await params;
  if (!isAuthContext(authContext) || !isAuthAction(action)) {
    return Response.json({ message: "Unsupported authentication route." }, { status: 404 });
  }

  const upstreamPath = AUTH_UPSTREAM_ENDPOINTS[authContext][action];

  if (action === "refresh") {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    const sessionContext = request.cookies.get(AUTH_CONTEXT_COOKIE)?.value;
    if (!refreshToken || sessionContext !== authContext) {
      return Response.json({ message: "Invalid refresh session." }, { status: 401 });
    }
    return proxyAuthRequest(request, upstreamPath, {
      authorization: `Bearer ${refreshToken}`,
      transformResponse: (body, response) => {
        if (body && typeof body === "object") {
          const data = (body as { data?: unknown }).data;
          if (isTokenPayload(data)) {
            const persistent = request.cookies.get(PERSISTENT_SESSION_COOKIE)?.value === "true";
            setSessionCookies(response, data, persistent, authContext);
          }
        }
        return stripTokens(body);
      },
    });
  }

  if (action === "login") {
    const persistent = request.headers.get("x-remember-me") === "true";
    return proxyAuthRequest(request, upstreamPath, {
      transformResponse: (body, response) => {
        if (body && typeof body === "object") {
          const data = (body as { data?: unknown }).data;
          if (isTokenPayload(data)) setSessionCookies(response, data, persistent, authContext);
        }
        return stripTokens(body);
      },
    });
  }

  if (action === "logout") {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    return proxyAuthRequest(request, upstreamPath, {
      authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      method: "DELETE",
      transformResponse: (body, response) => {
        clearSessionCookies(response);
        return body;
      },
    });
  }

  return proxyAuthRequest(request, upstreamPath);
}
