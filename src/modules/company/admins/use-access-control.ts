"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./access-control-api";

export const useAdmins = (params: Record<string, unknown>, enabled = true) => useQuery({ queryKey: ["app", "admins", params], queryFn: () => api.getAdmins(params), enabled });
export const useRoles = (params: Record<string, unknown> = {}, enabled = true) => useQuery({ queryKey: ["app", "roles", params], queryFn: () => api.getRoles(params), enabled });
export const usePermissions = (enabled = true) => useQuery({ queryKey: ["app", "permissions"], queryFn: api.getPermissions, enabled });
const useAccessControlMutation = <TVariables,>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  affectedResources: Array<"admins" | "roles">,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all(affectedResources.map(resource =>
        queryClient.invalidateQueries({ queryKey: ["app", resource] }),
      ));
    },
  });
};

export const useCreateAdmin = () => useAccessControlMutation(api.createAdmin, ["admins", "roles"]);
export const useUpdateAdmin = () => useAccessControlMutation(api.updateAdmin, ["admins", "roles"]);
export const useDeleteAdmin = () => useAccessControlMutation(api.deleteAdmin, ["admins", "roles"]);
export const useCreateRole = () => useAccessControlMutation(api.createRole, ["roles"]);
export const useUpdateRole = () => useAccessControlMutation(api.updateRole, ["roles", "admins"]);
export const useDeleteRole = () => useAccessControlMutation(api.deleteRole, ["roles", "admins"]);
