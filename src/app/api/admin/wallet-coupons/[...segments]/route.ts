import type { NextRequest } from "next/server";
import { proxyAdminRequest } from "@/shared/lib/api/proxy";
async function forward(request: NextRequest, context: { params: Promise<{ segments: string[] }> }) { const { segments } = await context.params; return proxyAdminRequest(request, `/admin/wallet-coupons/${segments.map(encodeURIComponent).join("/")}`); }
export const GET = forward; export const POST = forward; export const PUT = forward; export const DELETE = forward;
