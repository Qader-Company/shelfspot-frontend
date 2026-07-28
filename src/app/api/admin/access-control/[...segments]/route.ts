import type { NextRequest } from "next/server";
import { proxyAdminRequest } from "@/shared/lib/api/proxy";
type Context={params:Promise<{segments:string[]}>};
async function forward(request:NextRequest,{params}:Context){const {segments}=await params;return proxyAdminRequest(request,`/admin/access-control/${segments.map(encodeURIComponent).join("/")}`)}
export const GET=forward; export const POST=forward; export const PUT=forward; export const PATCH=forward; export const DELETE=forward;
