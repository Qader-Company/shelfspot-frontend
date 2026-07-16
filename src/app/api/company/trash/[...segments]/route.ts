import type { NextRequest } from "next/server";
import { proxyCompanyRequest } from "@/shared/lib/api/proxy";

const resources = new Set(["brands", "sub-brands", "categories", "sub-categories", "products", "tasks"]);

async function upstream(context: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await context.params;
  const [resource, ...rest] = segments;
  if (!resource || !resources.has(resource)) return null;
  return `/company/${resource}/trash${rest.length ? `/${rest.map(encodeURIComponent).join("/")}` : ""}`;
}

async function forward(request: NextRequest, context: { params: Promise<{ segments: string[] }> }) {
  const path = await upstream(context);
  if (!path) return Response.json({ success: false, message: "Invalid trash resource." }, { status: 404 });
  return proxyCompanyRequest(request, path);
}

export const GET = forward;
export const POST = forward;
export const DELETE = forward;
