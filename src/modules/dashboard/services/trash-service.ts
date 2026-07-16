import { apiClient } from "@/shared/lib/api/client";

export type TrashResource = "brands" | "sub-brands" | "categories" | "sub-categories" | "products" | "tasks";
export interface TrashItem { id: string | number; name?: string; request_id?: string | number; title?: string; sku?: string; description?: string; active?: boolean; is_active?: boolean | number | "0" | "1"; deleted_at?: string; translations?: Array<{ locale?: string; name: string }> | Record<string, string | { name: string } | undefined>; }
export interface TrashResponse { success: boolean; message?: string; data: TrashItem[]; meta?: { current_page: number; last_page: number; per_page: number; total: number }; }
type TrashPage = Partial<NonNullable<TrashResponse["meta"]>> & { data: TrashItem[]; meta?: TrashResponse["meta"] };
type RawTrashResponse = Omit<TrashResponse, "data"> & { data: TrashItem[] | TrashPage };

export async function getTrash(resource: TrashResource, page: number): Promise<TrashResponse> {
  const { data: raw } = await apiClient.get<RawTrashResponse>(`/api/company/trash/${resource}`, { params: { per_page: 10, page } });
  if (Array.isArray(raw.data)) return raw as TrashResponse;
  const value = raw.data;
  return { success: raw.success, message: raw.message, data: value.data, meta: value.meta ?? (value.current_page != null && value.last_page != null ? { current_page: value.current_page, last_page: value.last_page, per_page: value.per_page ?? 10, total: value.total ?? value.data.length } : undefined) };
}
export async function restoreTrash(resource: TrashResource, ids: string[]) {
  const body = new URLSearchParams();
  ids.forEach((id, index) => body.append(`ids[${index}]`, String(Number(id))));

  return (await apiClient.post(
    `/api/company/trash/${resource}/bulk-restore`,
    body,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  )).data as { success: boolean; message: string };
}
export async function forceDeleteTrash(resource: TrashResource, ids: string[]) {
  const body = new URLSearchParams();
  ids.forEach((id, index) => body.append(`ids[${index}]`, String(Number(id))));

  return (await apiClient.delete(
    `/api/company/trash/${resource}/bulk-force-delete`,
    {
      data: body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    },
  )).data as { success: boolean; message: string };
}
