import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { proxyCompanyRequest } from "@/shared/lib/api/proxy";

const allowedActions = new Set(["cancel", "accept", "reject"]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  const { id, action } = await params;

  if (!allowedActions.has(action)) {
    return NextResponse.json({ success: false, message: "Unsupported task action." }, { status: 404 });
  }

  return proxyCompanyRequest(request, `/company/tasks/${id}/${action}`);
}
