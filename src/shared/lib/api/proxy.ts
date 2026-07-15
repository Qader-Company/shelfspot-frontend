import "server-only";

import axios from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createServerApiClient } from "@/shared/lib/api/server";
import {
  ACCESS_TOKEN_COOKIE,
  COMPANY_ID_COOKIE,
  clearSessionCookies,
} from "@/shared/lib/auth/session-cookies";

/**
 * Generic BFF proxy for authenticated company API routes.
 * Adds server-managed Authorization and X-Company-id headers before forwarding.
 */
export async function proxyCompanyRequest(
  request: NextRequest,
  upstreamPath: string,
) {
  const apiClient = await createServerApiClient();

  const isMultipart = request.headers
    .get("content-type")
    ?.includes("multipart/form-data");

  let body: string | FormData | undefined;

  if (request.method !== "GET" && request.method !== "HEAD") {
    if (isMultipart) {
      body = await request.formData();
    } else {
      body = await request.text() || undefined;
    }
  }

  const forwardedHeaders: Record<string, string> = {};

  const contentType = request.headers.get("content-type");
  if (contentType && !isMultipart) {
    // For multipart, let axios set the correct boundary automatically
    forwardedHeaders["Content-Type"] = contentType;
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (accessToken) {
    forwardedHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  const companyId = request.cookies.get(COMPANY_ID_COOKIE)?.value;
  if (companyId) {
    forwardedHeaders["X-Company-id"] = companyId;
  }

  const companySlug = request.headers.get("x-company-slug");
  if (companySlug) {
    forwardedHeaders["X-Company-Slug"] = companySlug;
  }

  try {
    const response = await apiClient.request({
      url: `${upstreamPath}${request.nextUrl.search}`,
      method: request.method,
      data: body || undefined,
      headers: forwardedHeaders,
      validateStatus: () => true,
    });

    const hasInvalidCompanyContext =
      response.status === 404 &&
      response.data &&
      typeof response.data === "object" &&
      (response.data as { message?: string }).message === "Company not found.";
    const nextResponse = NextResponse.json(response.data, {
      // Treat a stale company cookie as an invalid session so the client can
      // re-authenticate and receive the correct company context.
      status: hasInvalidCompanyContext ? 401 : response.status,
    });

    if (hasInvalidCompanyContext) {
      clearSessionCookies(nextResponse);
    }

    return nextResponse;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to complete the request.",
      },
      { status: 500 },
    );
  }
}
