import type { NextRequest } from "next/server";
import { proxyCompanyRequest } from "@/shared/lib/api/proxy";

export async function DELETE(request: NextRequest) {
  return proxyCompanyRequest(request, "/company/products/bulk-delete");
}
