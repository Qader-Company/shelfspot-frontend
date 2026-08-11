import type { NextRequest } from "next/server";
import { proxyCompanyRequest } from "@/shared/lib/api/proxy";

export async function PATCH(request: NextRequest) {
  return proxyCompanyRequest(request, "/company/notifications/read-all");
}
