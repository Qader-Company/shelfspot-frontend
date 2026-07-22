"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import * as api from "./access-control-api";

export const useAdmins = (params: Record<string, unknown>) => useQuery({ queryKey: ["app", "admins", params], queryFn: () => api.getAdmins(params) });
export const useRoles = (params: Record<string, unknown> = {}) => useQuery({ queryKey: ["app", "roles", params], queryFn: () => api.getRoles(params) });
export const usePermissions = () => useQuery({ queryKey: ["app", "permissions"], queryFn: api.getPermissions });
export const useCreateAdmin = () => useMutation({ mutationFn: api.createAdmin });
export const useUpdateAdmin = () => useMutation({ mutationFn: api.updateAdmin });
export const useDeleteAdmin = () => useMutation({ mutationFn: api.deleteAdmin });
export const useCreateRole = () => useMutation({ mutationFn: api.createRole });
export const useUpdateRole = () => useMutation({ mutationFn: api.updateRole });
export const useDeleteRole = () => useMutation({ mutationFn: api.deleteRole });
