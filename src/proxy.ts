import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);
const productionPrefix = process.env.NODE_ENV === "production" ? "__Host-" : "";
const accessTokenCookie = `${productionPrefix}shelfspot-access`;
const refreshTokenCookie = `${productionPrefix}shelfspot-refresh`;
const authContextCookie = `${productionPrefix}shelfspot-auth-context`;
const permissionsCookie = `${productionPrefix}shelfspot-permissions`;
const companyOwnerCookie = `${productionPrefix}shelfspot-company-owner`;
const dashboardPathPattern = /^\/(ar|en)\/dashboard(?:\/|$)/;
const adminDashboardPathPattern = /^\/(ar|en)\/admin\/?$/;

export default function proxy(request: NextRequest) {
  const dashboardMatch = request.nextUrl.pathname.match(dashboardPathPattern);
  const adminDashboardMatch = request.nextUrl.pathname.match(
    adminDashboardPathPattern,
  );

  if (dashboardMatch || adminDashboardMatch) {
    const hasSession =
      request.cookies.has(accessTokenCookie) ||
      request.cookies.has(refreshTokenCookie);

    const expectedContext = adminDashboardMatch ? "admin" : "company";
    const hasCorrectContext =
      request.cookies.get(authContextCookie)?.value === expectedContext;

    if (!hasSession || !hasCorrectContext) {
      const locale = (adminDashboardMatch ?? dashboardMatch)![1];
      const loginUrl = new URL(
        adminDashboardMatch ? `/${locale}/admin/login` : `/${locale}/login`,
        request.url,
      );
      return NextResponse.redirect(loginUrl);
    }

    if (dashboardMatch) {
      const permissions = new Set(
        request.cookies.get(permissionsCookie)?.value.split("|").filter(Boolean) ?? [],
      );
      const isCompanyOwner = request.cookies.get(companyOwnerCookie)?.value === "true";
      const relativePath = request.nextUrl.pathname.replace(/^\/(ar|en)\/dashboard/, "") || "/";

      if (
        !isCompanyOwner &&
        permissions.size === 0 &&
        !/^\/forbidden\/?$/.test(relativePath)
      ) {
        const locale = dashboardMatch[1];
        return NextResponse.redirect(
          new URL(`/${locale}/dashboard/forbidden`, request.url),
        );
      }

      const routeRules: Array<[RegExp, string[]]> = [
        [/^\/requests\/create\/?$/, ["create_task"]],
        [/^\/requests\/[^/]+\/edit\/?$/, ["edit_task"]],
        [/^\/requests(?:\/|$)/, ["view_task"]],
        [/^\/payment(?:\/|$)/, ["view_wallet"]],
        [/^\/admins(?:\/|$)/, ["view_admin", "view_role"]],
        [/^\/catalog\/brand(?:\/|$)/, ["view_brand"]],
        [/^\/catalog\/sub-brand(?:\/|$)/, ["view_sub_brand"]],
        [/^\/catalog\/category(?:\/|$)/, ["view_category"]],
        [/^\/catalog\/sub-category(?:\/|$)/, ["view_sub_category"]],
        [/^\/catalog\/product(?:\/|$)/, ["view_product"]],
        [/^\/trash(?:\/|$)/, ["delete_task", "delete_product"]],
        [/^\/profile(?:\/|$)/, ["view_company"]],
      ];
      const rule = routeRules.find(([pattern]) => pattern.test(relativePath));
      if (rule && !isCompanyOwner && !rule[1].some((permission) => permissions.has(permission))) {
        const locale = dashboardMatch[1];
        return NextResponse.redirect(new URL(`/${locale}/dashboard/forbidden`, request.url));
      }
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
