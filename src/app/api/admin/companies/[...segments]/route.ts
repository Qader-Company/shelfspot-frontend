import type { NextRequest } from "next/server";

import { proxyAdminRequest } from "@/shared/lib/api/proxy";

async function forward(
  request: NextRequest,
  context: { params: Promise<{ segments: string[] }> },
) {
  const { segments } = await context.params;
  const path = segments.map(encodeURIComponent).join("/");
  const isTemplate = path.endsWith("/excel/template");

  return proxyAdminRequest(request, `/admin/companies/${path}`, {
    responseType: isTemplate ? "arraybuffer" : undefined,
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const DELETE = forward;
