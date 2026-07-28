import type { NextRequest } from "next/server";

import { proxyAdminRequest } from "@/shared/lib/api/proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyAdminRequest(request, `/admin/payments/${encodeURIComponent(id)}`);
}
