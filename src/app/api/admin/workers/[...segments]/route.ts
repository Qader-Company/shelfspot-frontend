import type { NextRequest } from "next/server";

import { proxyAdminRequest } from "@/shared/lib/api/proxy";

type WorkerRouteContext = {
  params: Promise<{ segments: string[] }>;
};

async function forward(request: NextRequest, context: WorkerRouteContext) {
  const { segments } = await context.params;
  const upstreamSegments = segments[0] === "index" ? segments.slice(1) : segments;
  const suffix = upstreamSegments.length
    ? `/${upstreamSegments.map(encodeURIComponent).join("/")}`
    : "";

  return proxyAdminRequest(request, `/admin/workers${suffix}`);
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
