import type { NextRequest } from "next/server";

import { proxyCompanyRequest } from "@/shared/lib/api/proxy";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxyCompanyRequest(request, `/company/access-control/roles/${encodeURIComponent(id)}`);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxyCompanyRequest(request, `/company/access-control/roles/${encodeURIComponent(id)}`);
}
