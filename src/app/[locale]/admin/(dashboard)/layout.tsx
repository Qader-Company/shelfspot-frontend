import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { DashboardLayout, type DashboardSidebarItem } from "@/shared/components/dashboard";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const t = await getTranslations("adminDashboard");
  const unavailable = ROUTES.adminDashboard;
  const sidebarItems: DashboardSidebarItem[] = [
    { key: "dashboard", label: t("navigation.dashboard"), href: ROUTES.adminDashboard, icon: "dashboard" },
    { key: "companies", label: t("navigation.companies"), href: "/admin/companies", icon: "companies" },
    { key: "workers", label: t("navigation.merchandisers"), href: "/admin/merchandisers", icon: "workers" },
    { key: "requests", label: t("navigation.requests"), href: unavailable, icon: "box", disabled: true },
    { key: "promoCode", label: t("navigation.promoCode"), href: unavailable, icon: "promoCode", disabled: true },
    { key: "admins", label: t("navigation.admins"), href: unavailable, icon: "admins", disabled: true },
    { key: "payments", label: t("navigation.payments"), href: unavailable, icon: "payment", disabled: true },
    { key: "settings", label: t("navigation.settings"), href: unavailable, icon: "settings", disabled: true },
    { key: "services", label: t("navigation.services"), href: unavailable, icon: "services", disabled: true },
    { key: "trash", label: t("navigation.trash"), href: unavailable, icon: "trash", disabled: true },
    { key: "logout", label: t("navigation.logout"), href: ROUTES.login, icon: "logout" },
  ];

  return <DashboardLayout authContext="admin" sidebarItems={sidebarItems} primaryItemCount={5} user={{ name: t("user.name"), description: t("user.role") }} labels={{ navigation: t("navigation.label"), logo: t("navigation.logo"), search: t("header.searchLabel"), searchPlaceholder: t("header.searchPlaceholder"), searchNoResults: t("header.searchNoResults"), menu: t("header.menu"), notification: t("header.notification"), userMenu: t("header.userMenu") }}>{children}</DashboardLayout>;
}
