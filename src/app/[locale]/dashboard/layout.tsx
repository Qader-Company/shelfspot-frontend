import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

import { ROUTES } from "@/config/routes";
import { DashboardLayout } from "@/shared/components/dashboard";
import type { DashboardSidebarItem } from "@/shared/components/dashboard";
import { PermissionProvider } from "@/shared/components/auth/permission-provider";
import { COMPANY_OWNER_COOKIE, PERMISSIONS_COOKIE } from "@/shared/lib/auth/session-cookies";
import { ALL_COMPANY_PERMISSIONS, parsePermissions } from "@/shared/lib/auth/permissions";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [t, cookieStore] = await Promise.all([getTranslations("dashboard"), cookies()]);
  const permissions = parsePermissions(cookieStore.get(PERMISSIONS_COOKIE)?.value);
  if (cookieStore.get(COMPANY_OWNER_COOKIE)?.value === "true") {
    ALL_COMPANY_PERMISSIONS.forEach((permission) => permissions.add(permission));
  }

  const allSidebarItems: DashboardSidebarItem[] = [
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
  const catalogPermissions: Record<string, string> = {
    brand: "view_brand", subBrand: "view_sub_brand", category: "view_category",
    subCategory: "view_sub_category", product: "view_product",
  };
  const sidebarItems: DashboardSidebarItem[] = allSidebarItems.map((item) => item.key === "catalog"
    ? { ...item, children: item.children?.filter((child) => permissions.has(catalogPermissions[child.key] ?? "")) }
    : item).filter((item) => {
      if (item.key === "requests") return permissions.has("view_task");
      if (item.key === "payment") return permissions.has("view_wallet");
      if (item.key === "admins") return permissions.has("view_admin") || permissions.has("view_role");
      if (item.key === "trash") return permissions.has("delete_task") || permissions.has("delete_product");
      if (item.key === "catalog") return Boolean(item.children?.length);
      return true;
    });

  return (
    <PermissionProvider permissions={[...permissions]}>
    <DashboardLayout
      authContext="company"
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
        language: t("topbar.language"),
      }}
    >
      {children}
    </DashboardLayout>
    </PermissionProvider>
  );
}
