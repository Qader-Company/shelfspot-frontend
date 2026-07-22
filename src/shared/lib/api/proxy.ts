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
  options?: { responseType?: "arraybuffer" },
) {
  upstreamPath = upstreamPath.replace(/\/{2,}/g, "/");
  const referer = request.headers.get("referer");
  const adminCompanyMatch = referer?.match(
    /\/admin\/companies\/([^/?#]+)\/catalog(?:\/|$)/,
  );
  const adminCompanyId = adminCompanyMatch?.[1]
    ? decodeURIComponent(adminCompanyMatch[1])
    : null;

  if (adminCompanyId && upstreamPath.startsWith("/company/")) {
    upstreamPath = upstreamPath.replace(
      "/company/",
      `/admin/companies/${encodeURIComponent(adminCompanyId)}/`,
    );
  }
  const apiClient = await createServerApiClient();

  const isMultipart = request.headers
    .get("content-type")
    ?.includes("multipart/form-data");

  let body: string | ArrayBuffer | undefined;

  if (request.method !== "GET" && request.method !== "HEAD") {
    if (isMultipart) {
      // Preserve the browser-generated multipart body byte-for-byte. Parsing it
      // into Web FormData and asking Node's axios adapter to serialize it again
      // can turn uploaded Files into plain fields, causing backend image rules
      // to reject otherwise valid images.
      body = await request.arrayBuffer();
    } else {
      body = await request.text() || undefined;
    }
  }

  const forwardedHeaders: Record<string, string> = {};

  const contentType = request.headers.get("content-type");
  if (contentType) {
    // Multipart bodies retain their original boundary, matching the raw bytes.
    forwardedHeaders["Content-Type"] = contentType;
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (accessToken) {
    forwardedHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  const companyId = request.cookies.get(COMPANY_ID_COOKIE)?.value;
  if (companyId && !adminCompanyId) {
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
      data: body ?? undefined,
      headers: forwardedHeaders,
      responseType: options?.responseType,
      validateStatus: () => true,
    });

    if (options?.responseType === "arraybuffer") {
      const responseHeaders = new Headers();
      const contentType = response.headers["content-type"];
      const contentDisposition = response.headers["content-disposition"];

      if (contentType) responseHeaders.set("Content-Type", String(contentType));
      if (contentDisposition) {
        responseHeaders.set("Content-Disposition", String(contentDisposition));
      }

      return new NextResponse(new Uint8Array(response.data), {
        status: response.status,
        headers: responseHeaders,
      });
    }

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
