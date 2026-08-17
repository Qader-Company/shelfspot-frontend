import "server-only";

import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { NextResponse } from "next/server";
import { ALL_COMPANY_PERMISSIONS, serializePermissions } from "@/shared/lib/auth/permissions";

const productionPrefix = process.env.NODE_ENV === "production" ? "__Host-" : "";

export const ACCESS_TOKEN_COOKIE = `${productionPrefix}shelfspot-access`;
export const REFRESH_TOKEN_COOKIE = `${productionPrefix}shelfspot-refresh`;
export const PERSISTENT_SESSION_COOKIE = `${productionPrefix}shelfspot-persistent`;
export const COMPANY_ID_COOKIE = `${productionPrefix}shelfspot-company-id`;
export const AUTH_CONTEXT_COOKIE = `${productionPrefix}shelfspot-auth-context`;
export const PERMISSIONS_COOKIE = `${productionPrefix}shelfspot-permissions`;
export const COMPANY_OWNER_COOKIE = `${productionPrefix}shelfspot-company-owner`;

type TokenValue = string | { token: string; ttl?: number };

interface TokenPayload {
  access_token: TokenValue;
  refresh_token: TokenValue;
  token_type?: string;
  user?: {
    available_permissions?: unknown;
    not_available_permissions?: unknown;
    permissions?: unknown;
  } & Record<string, unknown>;
  company_id?: string | number;
}

function readToken(value: TokenValue) {
  return typeof value === "string" ? { token: value } : value;
}

function readCompanyId(payload: TokenPayload) {
  if (payload.company_id != null) return String(payload.company_id);
  if (!payload.user || typeof payload.user !== "object") return null;

  const user = payload.user as {
    company_id?: string | number;
    companyId?: string | number;
    company?: { id?: string | number };
  };

  const companyId = user.company_id ?? user.companyId ?? user.company?.id;
  return companyId == null ? null : String(companyId);
}

function cookieOptions(
  maxAge?: number,
  path = "/",
): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path,
    ...(maxAge ? { maxAge } : {}),
  };
}

export function isTokenPayload(value: unknown): value is TokenPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<TokenPayload>;
  return Boolean(payload.access_token && payload.refresh_token);
}

export function setSessionCookies(
  response: NextResponse,
  payload: TokenPayload,
  persistent: boolean,
  authContext: "company" | "admin" = "company",
) {
  const access = readToken(payload.access_token);
  const refresh = readToken(payload.refresh_token);
  const companyId = readCompanyId(payload);
  const isCompanyOwner = payload.user?.is_owner === true || payload.user?.is_owner === 1 || payload.user?.is_owner === "1";
  const permissions = isCompanyOwner
    ? ALL_COMPANY_PERMISSIONS.join("|")
    : serializePermissions(
        payload.user?.available_permissions ?? payload.user?.permissions,
      );

  response.cookies.set(
    AUTH_CONTEXT_COOKIE,
    authContext,
    cookieOptions(persistent && refresh.ttl ? refresh.ttl * 60 : undefined),
  );
  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    access.token,
    cookieOptions(persistent && access.ttl ? access.ttl * 60 : undefined),
  );
  if (companyId) {
    response.cookies.set(
      COMPANY_ID_COOKIE,
      companyId,
      cookieOptions(persistent && refresh.ttl ? refresh.ttl * 60 : undefined),
    );
  }
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    refresh.token,
    cookieOptions(
      persistent && refresh.ttl ? refresh.ttl * 60 : undefined,
    ),
  );
  response.cookies.set(
    PERSISTENT_SESSION_COOKIE,
    String(persistent),
    cookieOptions(persistent && refresh.ttl ? refresh.ttl * 60 : undefined),
  );
  if (authContext === "company" && permissions) {
    response.cookies.set(
      PERMISSIONS_COOKIE,
      permissions,
      cookieOptions(persistent && refresh.ttl ? refresh.ttl * 60 : undefined),
    );
  }
  if (authContext === "company") {
    response.cookies.set(
      COMPANY_OWNER_COOKIE,
      String(isCompanyOwner),
      cookieOptions(persistent && refresh.ttl ? refresh.ttl * 60 : undefined),
    );
  }
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(PERSISTENT_SESSION_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(COMPANY_ID_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(AUTH_CONTEXT_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(PERMISSIONS_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(COMPANY_OWNER_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
}

export function stripTokens<T>(body: T): T {
  if (!body || typeof body !== "object") return body;
  const result = structuredClone(body) as Record<string, unknown>;
  const data = result.data;

  if (data && typeof data === "object") {
    delete (data as Record<string, unknown>).access_token;
    delete (data as Record<string, unknown>).refresh_token;
    delete (data as Record<string, unknown>).token_type;
  }

  return result as T;
}
