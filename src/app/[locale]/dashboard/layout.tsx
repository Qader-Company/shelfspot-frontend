import {
  BookOpen,
  Boxes,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Trash2,
  Users,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { DashboardLayout } from "@/shared/components/dashboard";
import type { DashboardSidebarItem } from "@/shared/components/dashboard";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("dashboard");

  const sidebarItems: DashboardSidebarItem[] = [
    {
      key: "home",
      label: t("navigation.dashboard"),
      href: ROUTES.dashboard,
      icon: LayoutDashboard,
    },
    {
      key: "requests",
      label: t("navigation.requests"),
      href: ROUTES.dashboardRequests,
      icon: Boxes,
    },
    {
      key: "payment",
      label: t("navigation.payment"),
      href: ROUTES.dashboardPayment,
      icon: CreditCard,
    },
    {
      key: "catalog",
      label: t("navigation.catalog"),
      href: ROUTES.dashboardCatalog,
      icon: BookOpen,
      trailingIcon: ChevronDown,
    },
    {
      key: "admins",
      label: t("navigation.admins"),
      href: ROUTES.dashboardAdmins,
      icon: Users,
    },
    {
      key: "trash",
      label: t("navigation.trash"),
      href: ROUTES.dashboardTrash,
      icon: Trash2,
    },
    {
      key: "logout",
      label: t("navigation.logout"),
      href: ROUTES.login,
      icon: LogOut,
    },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      activeSidebarItemKey="home"
      user={{
        name: t("user.name"),
        description: t("user.description"),
      }}
      labels={{
        navigation: t("navigation.label"),
        search: t("topbar.searchLabel"),
        searchPlaceholder: t("topbar.searchPlaceholder"),
        menu: t("topbar.menu"),
        notification: t("topbar.notification"),
        userMenu: t("topbar.userMenu"),
      }}
    >
      {children}
    </DashboardLayout>
  );
}
