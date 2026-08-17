import type { NextRequest } from "next/server";
import { proxyAdminRequest } from "@/shared/lib/api/proxy";

export async function GET(request: NextRequest) {
  return proxyAdminRequest(request, "/admin/tasks");
}
