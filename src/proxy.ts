import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);
const productionPrefix = process.env.NODE_ENV === "production" ? "__Host-" : "";
const accessTokenCookie = `${productionPrefix}shelfspot-access`;
const refreshTokenCookie = `${productionPrefix}shelfspot-refresh`;
const authContextCookie = `${productionPrefix}shelfspot-auth-context`;
const dashboardPathPattern = /^\/(ar|en)\/dashboard(?:\/|$)/;
const adminDashboardPathPattern = /^\/(ar|en)\/admin\/?$/;

export default function proxy(request: NextRequest) {
  const dashboardMatch = request.nextUrl.pathname.match(dashboardPathPattern);
  const adminDashboardMatch = request.nextUrl.pathname.match(adminDashboardPathPattern);

  if (dashboardMatch || adminDashboardMatch) {
    const hasSession =
      request.cookies.has(accessTokenCookie) ||
      request.cookies.has(refreshTokenCookie);

    const expectedContext = adminDashboardMatch ? "admin" : "company";
    const hasCorrectContext = request.cookies.get(authContextCookie)?.value === expectedContext;
    if (!hasSession || !hasCorrectContext) {
      const locale = (adminDashboardMatch ?? dashboardMatch)![1];
      const loginUrl = new URL(adminDashboardMatch ? `/${locale}/admin/login` : `/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
