import type { NextRequest } from "next/server";

import { API_CONFIG } from "@/config/api";
import { proxyCompanyRequest } from "@/shared/lib/api/proxy";

export async function GET(request: NextRequest) {
  const baseUrl = API_CONFIG.serverV2BaseUrl;
  if (!baseUrl) {
    return Response.json(
      { success: false, message: "API base URL is not configured." },
      { status: 500 },
    );
  }

  return proxyCompanyRequest(
    request,
    `${baseUrl}/company/access-control/permissions`,
  );
}
