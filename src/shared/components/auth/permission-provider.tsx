"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { CompanyPermission } from "@/shared/lib/auth/permissions";

const PermissionContext = createContext<ReadonlySet<string>>(new Set());

export function PermissionProvider({ permissions, children }: { permissions: string[]; children: ReactNode }) {
  const value = useMemo(() => new Set(permissions), [permissions]);
  return <PermissionContext value={value}>{children}</PermissionContext>;
}

export function usePermission(permission: CompanyPermission) {
  return useContext(PermissionContext).has(permission);
}

export function useAnyPermission(permissions: readonly CompanyPermission[]) {
  const granted = useContext(PermissionContext);
  return permissions.some((permission) => granted.has(permission));
}

export function PermissionGate({ permission, children }: { permission: CompanyPermission; children: ReactNode }) {
  return usePermission(permission) ? children : null;
}
