import { apiClient } from "@/shared/lib/api/client";
import type { Admin, AdminPayload, Id, ListResult, Permission, Role, RolePayload } from "./types";

function listFrom<T>(value: unknown): ListResult<T> {
  if (!value || typeof value !== "object") return { items: [] };
  const data = (value as { data?: unknown }).data;
  if (Array.isArray(data)) return { items: data as T[] };
  if (data && typeof data === "object") {
    const nested = (data as { data?: unknown }).data;
    if (Array.isArray(nested)) return { items: nested as T[] };
  }
  return { items: [] };
}
const adminBody = (p: AdminPayload) => ({ name: p.name, email: p.email, ...(p.password ? { password: p.password } : {}), is_active: p.is_active, "roles[]": p.roles });
const roleBody = (p: RolePayload) => ({ name: p.name, "permissions[]": p.permissions });
export async function getAdmins() { return listFrom<Admin>((await apiClient.get("/admin/access-control/admins")).data); }
export async function getRoles() { return listFrom<Role>((await apiClient.get("/admin/access-control/roles")).data); }
export async function getPermissions() { return listFrom<Permission>((await apiClient.get("/admin/access-control/permissions")).data).items; }
export async function createAdmin(p: AdminPayload) { return (await apiClient.post("/admin/access-control/admins", adminBody(p))).data; }
export async function updateAdmin(v: { id: Id; payload: AdminPayload }) { return (await apiClient.put(`/admin/access-control/admins/${v.id}`, adminBody(v.payload))).data; }
export async function deleteAdmin(id: Id) { return (await apiClient.delete(`/admin/access-control/admins/${id}`)).data; }
export async function createRole(p: RolePayload) { return (await apiClient.post("/admin/access-control/roles", roleBody(p))).data; }
export async function updateRole(v: { id: Id; payload: RolePayload }) { return (await apiClient.patch(`/admin/access-control/roles/${v.id}`, roleBody(v.payload))).data; }
export async function deleteRole(id: Id) { return (await apiClient.delete(`/admin/access-control/roles/${id}`)).data; }
