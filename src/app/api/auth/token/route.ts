import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/session-cookies";

/**
 * API endpoint to get the access token for WebSocket authentication
 * This is needed because the token is stored in HttpOnly cookies
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  return NextResponse.json({ access_token: token });
}
