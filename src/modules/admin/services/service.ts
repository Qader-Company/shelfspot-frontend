import { apiClient } from "@/shared/lib/api/client";

import type { AdminService, AdminServiceResponse, AdminServicesResponse, ServicePayload } from "./types";

/**
 * Normalise various response shapes into a flat AdminService[].
 * The backend may return:
 *   { data: AdminService[] }
 *   { data: { data: AdminService[] } }
 */
function listFrom(value: unknown): AdminService[] {
  if (!value || typeof value !== "object") return [];
  const root = value as { data?: unknown };
  if (Array.isArray(root.data)) return root.data as AdminService[];
  if (root.data && typeof root.data === "object") {
    const nested = (root.data as { data?: unknown }).data;
    if (Array.isArray(nested)) return nested as AdminService[];
  }
  return [];
}

/**
 * GET /admin/services
 * Pass active=1 for active only, active=0 for inactive only, omit for all.
 */
export async function getServices(active?: boolean): Promise<AdminService[]> {
  const params: Record<string, string | number> = {};
  if (active != null) params.active = active ? 1 : 0;

  const { data } = await apiClient.get<AdminServicesResponse>(
    "/api/admin/services",
    { params },
  );
  return listFrom(data);
}

/**
 * GET /admin/services/:key  (e.g. "primary_display")
 */
export async function getService(key: string): Promise<AdminService> {
  const { data } = await apiClient.get<AdminServiceResponse>(
    `/api/admin/services/${encodeURIComponent(key)}`,
  );
  // Handle both { data: service } and bare service shapes
  const service = (data as { data?: AdminService }).data ?? (data as unknown as AdminService);
  return service;
}

/**
 * PUT /admin/services/:id
 */
export async function updateService({
  id,
  payload,
}: {
  id: AdminService["id"];
  payload: ServicePayload;
}): Promise<unknown> {
  const { data } = await apiClient.put(
    `/api/admin/services/${encodeURIComponent(String(id))}`,
    {
      "translations[en][description]": payload.description,
      minimum_price: payload.minimum_price,
      minimum_execution_time: payload.minimum_execution_time,
      is_active: payload.is_active,
    },
  );
  return data;
}
