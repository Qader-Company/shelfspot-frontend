import type { NextRequest } from "next/server";
import { proxyAdminRequest } from "@/shared/lib/api/proxy";

export async function PATCH(request: NextRequest) {
  return proxyAdminRequest(request, "/admin/notifications/read-all");
}
