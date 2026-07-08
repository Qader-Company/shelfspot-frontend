import "server-only";

import axios from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createServerApiClient } from "@/shared/lib/api/server";

export async function proxyAuthRequest(
  request: NextRequest,
  upstreamPath: string,
) {
  const apiClient = await createServerApiClient();
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  try {
    const response = await apiClient.request({
      url: `${upstreamPath}${request.nextUrl.search}`,
      method: request.method,
      data: body || undefined,
      headers: {
        ...(request.headers.get("content-type")
          ? { "Content-Type": request.headers.get("content-type")! }
          : {}),
        ...(request.headers.get("authorization")
          ? { Authorization: request.headers.get("authorization")! }
          : {}),
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
