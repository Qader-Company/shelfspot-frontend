import { ChevronDown } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { DashboardLayout } from "@/shared/components/dashboard";
import {
  AdminsIcon,
  BoxIcon,
  CatalogIcon,
  DashboardGridIcon,
  LogoutIcon,
  PaymentIcon,
  TrashIcon,
} from "@/shared/components/dashboard/dashboard-icons";
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
      icon: DashboardGridIcon,
    },
    {
      key: "requests",
      label: t("navigation.requests"),
      href: ROUTES.dashboardRequests,
      icon: BoxIcon,
    },
    {
      key: "payment",
      label: t("navigation.payment"),
      href: ROUTES.dashboardPayment,
      icon: PaymentIcon,
    },
    {
      key: "catalog",
      label: t("navigation.catalog"),
      href: ROUTES.dashboardCatalog,
      icon: CatalogIcon,
      trailingIcon: ChevronDown,
    },
    {
      key: "admins",
      label: t("navigation.admins"),
      href: ROUTES.dashboardAdmins,
      icon: AdminsIcon,
    },
    {
      key: "trash",
      label: t("navigation.trash"),
      href: ROUTES.dashboardTrash,
      icon: TrashIcon,
    },
    {
      key: "logout",
      label: t("navigation.logout"),
      href: ROUTES.login,
      icon: LogoutIcon,
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
        logo: t("navigation.logo"),
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
