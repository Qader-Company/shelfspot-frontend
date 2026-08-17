import type { NextRequest } from "next/server";
import { proxyCompanyRequest } from "@/shared/lib/api/proxy";
async function path(context: { params: Promise<{ id: string }> }) { const { id } = await context.params; return `/company/products/${encodeURIComponent(id)}`; }
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) { return proxyCompanyRequest(request, await path(context)); }
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) { return proxyCompanyRequest(request, await path(context)); }
