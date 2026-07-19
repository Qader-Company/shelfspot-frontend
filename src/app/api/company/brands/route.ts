import type { NextRequest } from "next/server";

import { proxyCompanyRequest } from "@/shared/lib/api/proxy";

export async function GET(request: NextRequest) {
  return proxyCompanyRequest(request, "/company/brands");
}

export async function POST(request: NextRequest) {
  return proxyCompanyRequest(request, "/company/brands");
}
