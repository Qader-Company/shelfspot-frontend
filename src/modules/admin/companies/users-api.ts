import { apiClient } from "@/shared/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import type { CompanyUser } from "./users-view";
export interface CompanyRole { id: string; name: string }
interface ApiUser { id: number | string; name: string; email: string; phone?: string; is_active: boolean | number | string; roles: string[]; is_owner?: boolean; }
export interface UserFilters { search: string; role: string; is_active: string }
const endpoint = (companyId: string) => "/api/admin/companies/" + encodeURIComponent(companyId);
export const companyUsersKey = (companyId: string) => ["admin", "companies", companyId, "users"] as const;
export async function getCompanyRoles(companyId: string): Promise<CompanyRole[]> {
  const { data } = await apiClient.get<{ data: { id: number | string; name: string }[] }>(endpoint(companyId) + "/roles");
  return data.data.map(role => ({ id: String(role.id), name: role.name }));
}
export async function getCompanyUsers(companyId: string, filters?: UserFilters): Promise<CompanyUser[]> {
  const { data } = await apiClient.get<{ data: ApiUser[] }>(endpoint(companyId) + "/users", { params: filters });
  return data.data.map(normalizeCompanyUser);
}
export function useCompanyUsers(companyId: string, filters?: UserFilters) {
  return useQuery({ queryKey: [...companyUsersKey(companyId), filters ?? {}], queryFn: () => getCompanyUsers(companyId, filters) });
}
export function useCompanyRoles(companyId: string) {
  return useQuery({ queryKey: ["admin", "companies", companyId, "roles"], queryFn: () => getCompanyRoles(companyId) });
}

export function companyUserPayload(input: import("./users-view").CompanyUserInput, existingRoles?: string[]) {
  return { name: input.name.trim(), email: input.email.trim(), is_active: input.active ? 1 : 0, roles: existingRoles ?? [input.roleId], ...(input.password ? { password: input.password } : {}) };
}
export async function saveCompanyUser(companyId: string, input: import("./users-view").CompanyUserInput, id?: string, existingRoles?: string[]) {
  const payload = companyUserPayload(input, existingRoles);
  if (id) await apiClient.patch(endpoint(companyId) + "/users/" + encodeURIComponent(id), payload);
  else await apiClient.post(endpoint(companyId) + "/users", payload);
}
export async function deleteCompanyUser(companyId: string, id: string) {
  await apiClient.delete(endpoint(companyId) + "/users/" + encodeURIComponent(id));
}

function normalizeCompanyUser(user: ApiUser): CompanyUser {
  return { id: String(user.id), name: user.name, email: user.email, phone: user.phone ?? "", active: [true, 1, "1"].includes(user.is_active), roleId: user.roles[0] ?? "", roleName: user.roles.join(", "), roles: user.roles, owner: Boolean(user.is_owner) };
}

export async function getCompanyUser(companyId: string, id: string): Promise<CompanyUser> {
  const { data } = await apiClient.get<{ data: ApiUser }>(endpoint(companyId) + "/users/" + encodeURIComponent(id));
  return normalizeCompanyUser(data.data);
}
