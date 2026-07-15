import "server-only";

import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { NextResponse } from "next/server";

const productionPrefix = process.env.NODE_ENV === "production" ? "__Host-" : "";

export const ACCESS_TOKEN_COOKIE = `${productionPrefix}shelfspot-access`;
export const REFRESH_TOKEN_COOKIE = `${productionPrefix}shelfspot-refresh`;
export const PERSISTENT_SESSION_COOKIE = `${productionPrefix}shelfspot-persistent`;

type TokenValue = string | { token: string; ttl?: number };

interface TokenPayload {
  access_token: TokenValue;
  refresh_token: TokenValue;
  token_type?: string;
}

function readToken(value: TokenValue) {
  return typeof value === "string" ? { token: value } : value;
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
) {
  const access = readToken(payload.access_token);
  const refresh = readToken(payload.refresh_token);

  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    access.token,
    cookieOptions(persistent && access.ttl ? access.ttl * 60 : undefined),
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    refresh.token,
    cookieOptions(
      persistent && refresh.ttl ? refresh.ttl * 60 : undefined,
      "/api/auth",
    ),
  );
  response.cookies.set(
    PERSISTENT_SESSION_COOKIE,
    String(persistent),
    cookieOptions(persistent && refresh.ttl ? refresh.ttl * 60 : undefined, "/api/auth"),
  );
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...cookieOptions(undefined, "/api/auth"),
    maxAge: 0,
  });
  response.cookies.set(PERSISTENT_SESSION_COOKIE, "", {
    ...cookieOptions(undefined, "/api/auth"),
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
