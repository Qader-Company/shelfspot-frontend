import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

import { API_CONFIG } from "@/config/api";
import { proxyAdminRequest } from "@/shared/lib/api/proxy";

function forward(request: NextRequest) {
  return proxyAdminRequest(request, "/admin/platform-settings/");
}

export function GET(request: NextRequest) {
  return proxyAdminRequest(request, API_CONFIG.platformSettingsReadUrl);
}

export async function PUT(request: NextRequest) {
  const response = await forward(request);

  if (response.ok) {
    revalidatePath("/", "layout");
    revalidatePath("/en");
    revalidatePath("/ar");
  }

  return response;
}
