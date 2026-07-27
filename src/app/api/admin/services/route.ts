import type{NextRequest}from"next/server";import{proxyAdminRequest}from"@/shared/lib/api/proxy";export async function GET(r:NextRequest){return proxyAdminRequest(r,"/admin/services")}
