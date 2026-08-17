import type { NextRequest } from "next/server";

import { proxyCompanyRequest } from "@/shared/lib/api/proxy";

type Context = { params: Promise<{ id: string }> };

async function path(context: Context) {
  return `/company/tasks/${(await context.params).id}`;
}

export async function GET(request: NextRequest, context: Context) {
  return proxyCompanyRequest(request, await path(context));
}

export async function PATCH(request: NextRequest, context: Context) {
  return proxyCompanyRequest(request, await path(context));
}

export async function POST(request: NextRequest, context: Context) {
  return proxyCompanyRequest(request, await path(context));
}

export async function DELETE(request: NextRequest, context: Context) {
  return proxyCompanyRequest(request, await path(context));
}
