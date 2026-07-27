"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./service";
import type { AdminPayload, Id, RolePayload } from "./types";
const keys = { root: ["admin", "access-control"] as const, admins: ["admin", "access-control", "admins"] as const, roles: ["admin", "access-control", "roles"] as const, permissions: ["admin", "access-control", "permissions"] as const };
export function useAccessControl() {
  const client = useQueryClient(); const done = () => client.invalidateQueries({ queryKey: keys.root });
  return { admins: useQuery({ queryKey: keys.admins, queryFn: api.getAdmins }), roles: useQuery({ queryKey: keys.roles, queryFn: api.getRoles }), permissions: useQuery({ queryKey: keys.permissions, queryFn: api.getPermissions }),
    createAdmin: useMutation({ mutationFn: (p: AdminPayload) => api.createAdmin(p), onSuccess: done }), updateAdmin: useMutation({ mutationFn: (v: { id: Id; payload: AdminPayload }) => api.updateAdmin(v), onSuccess: done }), deleteAdmin: useMutation({ mutationFn: (id: Id) => api.deleteAdmin(id), onSuccess: done }),
    createRole: useMutation({ mutationFn: (p: RolePayload) => api.createRole(p), onSuccess: done }), updateRole: useMutation({ mutationFn: (v: { id: Id; payload: RolePayload }) => api.updateRole(v), onSuccess: done }), deleteRole: useMutation({ mutationFn: (id: Id) => api.deleteRole(id), onSuccess: done }) };
}
