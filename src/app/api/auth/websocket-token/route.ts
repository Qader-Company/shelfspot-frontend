import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/session-cookies";

/**
 * Returns the access token for WebSocket authentication
 * This is needed because the httpOnly cookie cannot be read by client-side JavaScript
 */
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "No access token found" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      access_token: accessToken,
    },
  });
}
