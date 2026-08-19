import { apiClient } from "@/shared/lib/api/client";

export interface Permission { id: number | string; name: string; label?: string; portal?: string; }
export interface PermissionGroup { key: string; label: string; permissions: Permission[]; }
export interface Role { id: number | string; name: string; active?: boolean; is_active?: boolean | number; users_count?: number; admins_count?: number; permissions?: Permission[]; is_default?: boolean | number; is_system?: boolean | number; is_builtin?: boolean | number; }
export interface Admin { id: number | string; name: string; email: string; phone?: string; phone_number?: string; active?: boolean; is_active?: boolean | number; role?: Role | string; role_id?: number | string; is_owner?: boolean | number; is_default?: boolean | number; is_primary?: boolean | number; }
export interface PageMeta { current_page?: number; last_page?: number; total?: number; }
export interface ListResult<T> { items: T[]; meta?: PageMeta; }

function listFrom<T>(response: unknown): ListResult<T> {
  const root = response as { data?: unknown; meta?: PageMeta };
  const body = root?.data;
  if (Array.isArray(body)) return { items: body as T[], meta: root.meta };
  if (body && typeof body === "object") {
    const nested = body as { data?: unknown; meta?: PageMeta; current_page?: number; last_page?: number; total?: number };
    if (Array.isArray(nested.data)) {
      return { items: nested.data as T[], meta: nested.meta ?? { current_page: nested.current_page, last_page: nested.last_page, total: nested.total } };
    }
    return { items: Object.values(body).flatMap((value) => Array.isArray(value) ? value : []) as T[] };
  }
  return { items: [] };
}

export async function getAdmins(params: Record<string, unknown>) {
  const { data } = await apiClient.get("/api/company/access-control/admins", { params });
  return listFrom<Admin>(data);
}
export async function getRoles(params: Record<string, unknown> = {}) {
  const { data } = await apiClient.get("/api/company/access-control/roles", { params });
  return listFrom<Role>(data);
}
export async function getPermissions() {
  const { data } = await apiClient.get("/api/company/access-control/permissions");
  return listFrom<PermissionGroup>(data).items;
}
export const createAdmin = (payload: Record<string, unknown>) => apiClient.post("/api/company/access-control/admins", payload).then(r => r.data);
export const updateAdmin = ({ id, payload }: { id: string | number; payload: Record<string, unknown> }) => apiClient.put(`/api/company/access-control/admins/${id}`, payload).then(r => r.data);
export const deleteAdmin = (id: string | number) => apiClient.delete(`/api/company/access-control/admins/${id}`).then(r => r.data);
export const createRole = (payload: Record<string, unknown>) => apiClient.post("/api/company/access-control/roles", payload).then(r => r.data);
export const updateRole = ({ id, payload }: { id: string | number; payload: Record<string, unknown> }) => apiClient.patch(`/api/company/access-control/roles/${id}`, payload).then(r => r.data);
export const deleteRole = (id: string | number) => apiClient.delete(`/api/company/access-control/roles/${id}`).then(r => r.data);
