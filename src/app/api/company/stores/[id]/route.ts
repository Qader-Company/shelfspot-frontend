import type { NextRequest } from "next/server";
import { proxyCompanyRequest } from "@/shared/lib/api/proxy";
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxyCompanyRequest(request, `/company/stores/${encodeURIComponent(id)}`);
}
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxyCompanyRequest(request, `/company/stores/${encodeURIComponent(id)}`);
}
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxyCompanyRequest(request, `/company/stores/${encodeURIComponent(id)}`);
}
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxyCompanyRequest(request, `/company/stores/${encodeURIComponent(id)}`);
}
