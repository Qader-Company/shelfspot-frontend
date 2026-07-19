import type { NextRequest } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  AUTH_CONTEXT_COOKIE,
} from "@/shared/lib/auth/session-cookies";

export function GET(request: NextRequest) {
  const authenticated = Boolean(
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ||
      request.cookies.get(REFRESH_TOKEN_COOKIE)?.value,
  );

  const context = request.cookies.get(AUTH_CONTEXT_COOKIE)?.value;
  return Response.json({ authenticated, context: context === "admin" || context === "company" ? context : null });
}
