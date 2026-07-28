import { adminApiClient } from "@/shared/lib/api/client";

import type {
  Admin,
  AdminPayload,
  Id,
  ListResult,
  Permission,
  Role,
  RolePayload,
} from "./types";

interface PageMeta {
  current_page?: number;
  last_page?: number;
  total?: number;
}

function listFrom<T>(response: unknown): ListResult<T> {
  if (!response || typeof response !== "object") return { items: [] };
  const root = response as { data?: unknown; meta?: PageMeta };
  const body = root.data;

  if (Array.isArray(body)) return { items: body as T[], meta: root.meta };
  if (body && typeof body === "object") {
    const nested = body as {
      data?: unknown;
      meta?: PageMeta;
      current_page?: number;
      last_page?: number;
      total?: number;
    };
    if (Array.isArray(nested.data)) {
      return {
        items: nested.data as T[],
        meta: nested.meta ?? {
          current_page: nested.current_page,
          last_page: nested.last_page,
          total: nested.total,
        },
      };
    }
    return {
      items: Object.values(body).flatMap((value) =>
        Array.isArray(value) ? value : [],
      ) as T[],
    };
  }

  return { items: [] };
}

const adminBody = (payload: AdminPayload) => ({
  name: payload.name,
  email: payload.email,
  ...(payload.password ? { password: payload.password } : {}),
  is_active: payload.is_active,
  "roles[]": payload.roles,
});

const roleBody = (payload: RolePayload) => ({
  name: payload.name,
  permissions: payload.permissions,
});

export async function getAdmins(params: Record<string, unknown> = {}) {
  const { data } = await adminApiClient.get("/api/admin/access-control/admins", {
    params,
  });
  return listFrom<Admin>(data);
}

export async function getRoles(params: Record<string, unknown> = {}) {
  const { data } = await adminApiClient.get("/api/admin/access-control/roles", {
    params,
  });
  return listFrom<Role>(data);
}

export async function getPermissions() {
  const { data } = await adminApiClient.get(
    "/api/admin/access-control/permissions",
  );
  return listFrom<Permission>(data).items;
}

export async function createAdmin(payload: AdminPayload) {
  return (
    await adminApiClient.post(
      "/api/admin/access-control/admins",
      adminBody(payload),
    )
  ).data;
}

export async function updateAdmin({ id, payload }: { id: Id; payload: AdminPayload }) {
  return (
    await adminApiClient.put(
      `/api/admin/access-control/admins/${encodeURIComponent(id)}`,
      adminBody(payload),
    )
  ).data;
}

export async function deleteAdmin(id: Id) {
  return (
    await adminApiClient.delete(
      `/api/admin/access-control/admins/${encodeURIComponent(id)}`,
    )
  ).data;
}

export async function createRole(payload: RolePayload) {
  return (
    await adminApiClient.post(
      "/api/admin/access-control/roles",
      roleBody(payload),
    )
  ).data;
}

export async function updateRole({ id, payload }: { id: Id; payload: RolePayload }) {
  return (
    await adminApiClient.patch(
      `/api/admin/access-control/roles/${encodeURIComponent(id)}`,
      roleBody(payload),
    )
  ).data;
}

export async function deleteRole(id: Id) {
  return (
    await adminApiClient.delete(
      `/api/admin/access-control/roles/${encodeURIComponent(id)}`,
    )
  ).data;
}
