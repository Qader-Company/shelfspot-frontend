import type { NextRequest } from "next/server";

import { proxyCompanyRequest } from "@/shared/lib/api/proxy";

async function getPath(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return `/company/sub-brands/${encodeURIComponent(id)}`;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return proxyCompanyRequest(request, await getPath(context));
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return proxyCompanyRequest(request, await getPath(context));
}
