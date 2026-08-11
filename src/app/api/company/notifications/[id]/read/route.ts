import type { NextRequest } from "next/server";
import { proxyCompanyRequest } from "@/shared/lib/api/proxy";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyCompanyRequest(request, `/company/notifications/${id}/read`);
}
