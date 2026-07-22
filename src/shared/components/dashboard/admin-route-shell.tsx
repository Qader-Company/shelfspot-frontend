"use client";

import { usePathname } from "@/i18n/navigation";

interface AdminRouteShellProps {
  children: React.ReactNode;
  dashboard: React.ReactNode;
}

export function AdminRouteShell({ children, dashboard }: AdminRouteShellProps) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return children;
  }

  return dashboard;
}
