import { NextResponse } from "next/server";

import { clearSessionCookies } from "@/shared/lib/auth/session-cookies";

export function POST() {
  const response = NextResponse.json({ success: true });
  clearSessionCookies(response);
  return response;
}
