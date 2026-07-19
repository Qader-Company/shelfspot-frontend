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

  const companyAuthMatch = request.nextUrl.pathname.match(/^\/(ar|en)\/(login|forgot-password|otp-verification|reset-password)$/);
  if (companyAuthMatch) {
    const [, locale, action] = companyAuthMatch;
    const internalAction = action === "otp-verification" ? "verify-otp" : action;
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${locale}/company/${internalAction}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  const legacyAdminOtpMatch = request.nextUrl.pathname.match(/^\/(ar|en)\/admin\/otp-verification$/);
  if (legacyAdminOtpMatch) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${legacyAdminOtpMatch[1]}/admin/verify-otp`;
    return NextResponse.rewrite(rewriteUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
