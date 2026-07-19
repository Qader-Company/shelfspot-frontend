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
      icon: "dashboard",
    },
    {
      key: "requests",
      label: t("navigation.requests"),
      href: ROUTES.dashboardRequests,
      icon: "box",
    },
    {
      key: "payment",
      label: t("navigation.payment"),
      href: ROUTES.dashboardPayment,
      icon: "payment",
    },
    {
      key: "catalog",
      label: t("navigation.catalog"),
      href: ROUTES.dashboardCatalogBrand,
      icon: "catalog",
      trailingIcon: "chevron",
      children: [
        { key: "brand",       label: t("navigation.catalogBrand"),       href: ROUTES.dashboardCatalogBrand },
        { key: "subBrand",    label: t("navigation.catalogSubBrand"),    href: ROUTES.dashboardCatalogSubBrand },
        { key: "category",    label: t("navigation.catalogCategory"),    href: ROUTES.dashboardCatalogCategory },
        { key: "subCategory", label: t("navigation.catalogSubCategory"), href: ROUTES.dashboardCatalogSubCategory },
        { key: "product",     label: t("navigation.catalogProduct"),     href: ROUTES.dashboardCatalogProduct },
      ],
    },
    {
      key: "admins",
      label: t("navigation.admins"),
      href: ROUTES.dashboardAdmins,
      icon: "admins",
    },
    {
      key: "trash",
      label: t("navigation.trash"),
      href: ROUTES.dashboardTrash,
      icon: "trash",
    },
    {
      key: "logout",
      label: t("navigation.logout"),
      href: ROUTES.login,
      icon: "logout",
    },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      user={{
        name: t("user.name"),
        description: t("user.description"),
      }}
      labels={{
        navigation: t("navigation.label"),
        logo: t("navigation.logo"),
        search: t("topbar.searchLabel"),
        searchPlaceholder: t("topbar.searchPlaceholder"),
        searchNoResults: t("topbar.searchNoResults"),
        menu: t("topbar.menu"),
        notification: t("topbar.notification"),
        userMenu: t("topbar.userMenu"),
      }}
    >
      {children}
    </DashboardLayout>
  );
}
