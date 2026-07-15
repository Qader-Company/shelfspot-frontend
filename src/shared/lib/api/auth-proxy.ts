import "server-only";

import axios from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createServerApiClient } from "@/shared/lib/api/server";

/**
 * Converts a JSON body to a FormData instance so the upstream backend
 * (which expects multipart/form-data) can parse the fields correctly.
 */
function jsonToFormData(json: Record<string, unknown>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(json)) {
    if (value !== undefined && value !== null) {
      form.append(key, String(value));
    }
  }
  return form;
}

export async function proxyAuthRequest(
  request: NextRequest,
  upstreamPath: string,
) {
  const apiClient = await createServerApiClient();

  const isBodyless = request.method === "GET" || request.method === "HEAD";
  const contentType = request.headers.get("content-type") ?? "";

  let data: FormData | string | undefined;

  if (!isBodyless) {
    if (contentType.includes("application/json")) {
      // Backend expects multipart/form-data — convert transparently
      const json = (await request.json()) as Record<string, unknown>;
      data = jsonToFormData(json);
    } else {
      const text = await request.text();
      data = text || undefined;
    }
  }

  try {
    const response = await apiClient.request({
      url: `${upstreamPath}${request.nextUrl.search}`,
      method: request.method,
      data,
      headers: {
        ...(request.headers.get("authorization")
          ? { Authorization: request.headers.get("authorization")! }
          : {}),
        // Let axios set Content-Type automatically when sending FormData
        // (it needs to include the multipart boundary)
      },
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
      {
        status: 500,
      },
    );
  }
}
