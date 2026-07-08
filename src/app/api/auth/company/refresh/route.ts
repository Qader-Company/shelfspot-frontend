import type { NextRequest } from "next/server";

import { proxyAuthRequest } from "@/shared/lib/api/auth-proxy";

export async function POST(request: NextRequest) {
  return proxyAuthRequest(request, "/auth/company/refresh");
}
