import type { NextRequest } from "next/server";

import { proxyAuthRequest } from "@/shared/lib/api/auth-proxy";

export async function PATCH(request: NextRequest) {
  return proxyAuthRequest(request, "/auth/company/email-verification");
}
