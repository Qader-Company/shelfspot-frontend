import { adminApiClient } from "@/shared/lib/api/client";
import type { AdminMerchandiser, MerchandiserListParams, MerchandiserListResult, MerchandiserPayload, MerchandiserRequest } from "./types";

type ApiRecord = Partial<AdminMerchandiser> & {
  name?: string;
  full_name?: string;
  is_active?: boolean | 0 | 1 | "0" | "1";
  completed_tasks?: number;
  start_date?: string;
  job_title?: "merchandiser";
  login_enabled?: boolean;
  temporary_password?: string;
  photo?: string;
  request_history?: MerchandiserRequest[];
};

type ApiResponse<T> = { success?: boolean; message?: string; data: T };
type PaginatedResponse = ApiResponse<ApiRecord[] | { data: ApiRecord[]; current_page?: number; last_page?: number; total?: number }> & { meta?: { current_page?: number; last_page?: number; total?: number } };

function normalize(record: ApiRecord): AdminMerchandiser {
  return {
    id: String(record.id ?? ""),
    fullName: record.fullName ?? record.full_name ?? record.name ?? "—",
    email: record.email ?? "—",
    phone: record.phone ?? "—",
    photoUrl: record.photoUrl ?? record.photo,
    jobTitle: record.jobTitle ?? record.job_title ?? "merchandiser",
    startDate: record.startDate ?? record.start_date ?? "",
    loginEnabled: record.loginEnabled ?? record.login_enabled ?? true,
    temporaryPassword: record.temporaryPassword ?? record.temporary_password ?? "",
    active:
      record.active ??
      (record.is_active === true ||
        record.is_active === 1 ||
        record.is_active === "1"),
    completedTasks: record.completedTasks ?? record.completed_tasks ?? 0,
    currentTask: record.currentTask,
    requests: record.requests ?? record.request_history ?? [],
  };
}

export async function getMerchandisers(params: MerchandiserListParams): Promise<MerchandiserListResult> {
  const { data: response } = await adminApiClient.get<PaginatedResponse>("/api/admin/workers", { params: { search: params.search || undefined, status: params.status === "all" ? undefined : params.status, page: params.page, per_page: params.perPage } });
  const nested = Array.isArray(response.data) ? null : response.data;
  const records = (Array.isArray(response.data) ? response.data : response.data.data).map(normalize);
  const total = response.meta?.total ?? nested?.total ?? records.length;
  const active = records.filter((record) => record.active).length;
  return { data: records, meta: { total, active, inactive: Math.max(total - active, 0), currentPage: response.meta?.current_page ?? nested?.current_page ?? params.page, lastPage: response.meta?.last_page ?? nested?.last_page ?? 1 } };
}

export async function getMerchandiser(id: string) {
  let page = 1;

  while (true) {
    const result = await getMerchandisers({ page, perPage: 100, status: "all" });
    const record = result.data.find((worker) => worker.id === id);

    if (record) return record;
    if (page >= result.meta.lastPage) break;
    page += 1;
  }

  throw new Error("Merchandiser not found.");
}

function payloadForm(payload: MerchandiserPayload, update = false) {
  const data = new FormData();
  data.append("name", payload.fullName);
  data.append("email", payload.email);
  data.append("phone", payload.phone);
  data.append("login_enabled", payload.loginEnabled ? "1" : "0");
  data.append("password", payload.temporaryPassword);
  data.append("password_confirmation", payload.temporaryPassword);
  if (update) data.append("_method", "put");
  return data;
}

export async function createMerchandiser(payload: MerchandiserPayload) {
  const { data } = await adminApiClient.post<ApiResponse<ApiRecord>>("/api/admin/workers", payloadForm(payload), { headers: { "Content-Type": "multipart/form-data" } });
  return normalize(data.data);
}

export async function updateMerchandiser({ id, payload }: { id: string; payload: MerchandiserPayload }) {
  const { data } = await adminApiClient.post<ApiResponse<ApiRecord>>(`/api/admin/workers/${encodeURIComponent(id)}`, payloadForm(payload, true), { headers: { "Content-Type": "multipart/form-data" } });
  return normalize(data.data);
}

export async function deleteMerchandiser(id: string) { return (await adminApiClient.delete(`/api/admin/workers/${encodeURIComponent(id)}`)).data; }

export async function deleteMerchandisers(ids: string[]) { return (await adminApiClient.delete("/api/admin/workers/bulk-delete", { data: { ids } })).data; }

export async function updateMerchandiserStatus({ id, active }: { id: string; active: boolean }) {
  const body = new URLSearchParams({ is_active: active ? "1" : "0" });
  return (await adminApiClient.put(`/api/admin/workers/${encodeURIComponent(id)}`, body, { headers: { "Content-Type": "application/x-www-form-urlencoded" } })).data;
}

export async function deleteMerchandiserRequest(input: {
  merchandiserId: string;
  requestId: string;
}) {
  void input;
  throw new Error("The Admin Requests endpoint was not provided.");
}
