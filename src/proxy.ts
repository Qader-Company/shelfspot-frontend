import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);
const productionPrefix = process.env.NODE_ENV === "production" ? "__Host-" : "";
const accessTokenCookie = `${productionPrefix}shelfspot-access`;
const refreshTokenCookie = `${productionPrefix}shelfspot-refresh`;
const dashboardPathPattern = /^\/(ar|en)\/dashboard(?:\/|$)/;

export default function proxy(request: NextRequest) {
  const dashboardMatch = request.nextUrl.pathname.match(dashboardPathPattern);

  if (dashboardMatch) {
    const hasSession =
      request.cookies.has(accessTokenCookie) ||
      request.cookies.has(refreshTokenCookie);

    if (!hasSession) {
      const locale = dashboardMatch[1];
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
