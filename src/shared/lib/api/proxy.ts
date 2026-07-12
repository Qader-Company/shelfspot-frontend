import "server-only";

import axios from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createServerApiClient } from "@/shared/lib/api/server";

/**
 * Generic BFF proxy for authenticated company API routes.
 * Forwards Authorization, X-Company-Slug, and Content-Type headers to the upstream server.
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

  const authorization = request.headers.get("authorization");
  if (authorization) {
    forwardedHeaders["Authorization"] = authorization;
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

    return NextResponse.json(response.data, {
      status: response.status,
    });
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
