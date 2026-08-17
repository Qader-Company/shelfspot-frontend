import type { NextRequest } from "next/server";

import { API_CONFIG } from "@/config/api";
import { proxyAuthRequest } from "@/shared/lib/api/auth-proxy";

export async function POST(request: NextRequest) {
  return proxyAuthRequest(request, "/auth/company/register", {
    apiKey: API_CONFIG.companyApiKey,
  });
}
