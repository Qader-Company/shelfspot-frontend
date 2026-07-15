import type { NextRequest } from "next/server";

import { proxyCompanyRequest } from "@/shared/lib/api/proxy";

export async function GET(request: NextRequest) {
  return proxyCompanyRequest(request, "/company/reports/dashboard");
}
