"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AddIcon } from "@/shared/components/dashboard/dashboard-icons";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { usePermission } from "@/shared/components/auth/permission-provider";
import { AdminFormDialog } from "./admin-form-dialog";
import type { Admin, Role } from "./access-control-api";
import { AdminsTable } from "./admins-table";
import { RoleFormDialog } from "./role-form-dialog";
import { RolesTable } from "./roles-table";
import { useAdmins, useCreateAdmin, useCreateRole, useDeleteAdmin, useDeleteRole, usePermissions, useRoles, useUpdateAdmin, useUpdateRole } from "./use-access-control";

type Tab = "admins" | "roles";
type Dialog = "admin" | "role" | "delete-admin" | "delete-role" | null;
const activeOf = (item: { active?: boolean; is_active?: boolean | number }) => Boolean(item.active ?? item.is_active);

export function AdminsPage() {
  const t = useTranslations("dashboard");
  const canViewAdmins = usePermission("view_admin"); const canViewRoles = usePermission("view_role");
  const canCreateAdmin = usePermission("create_admin"); const canCreateRole = usePermission("create_role");
  const [tab, setTab] = useState<Tab>(canViewAdmins ? "admins" : "roles"); const [dialog, setDialog] = useState<Dialog>(null); const [search, setSearch] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<Admin>(); const [selectedRole, setSelectedRole] = useState<Role>();
  const admins = useAdmins({ per_page: 100 }, canViewAdmins); const roles = useRoles({ per_page: 100 }, canViewRoles); const permissions = usePermissions(canViewRoles);
  const createAdmin = useCreateAdmin(); const updateAdmin = useUpdateAdmin(); const removeAdmin = useDeleteAdmin(); const createRole = useCreateRole(); const updateRole = useUpdateRole(); const removeRole = useDeleteRole();
  const adminRows = useMemo(() => (admins.data?.items ?? []).filter(a => `${a.name} ${a.email} ${a.phone ?? a.phone_number ?? ""} ${typeof a.role === "object" ? a.role.name : a.role ?? ""}`.toLowerCase().includes(search.toLowerCase())).map(a => ({ id: String(a.id), name: a.name, phone: a.phone ?? a.phone_number ?? "-", email: a.email, role: typeof a.role === "object" ? a.role.name : a.role ?? "-", isActive: activeOf(a as Admin & { is_active?: boolean | number }) })), [admins.data, search]);
  const roleRows = useMemo(() => (roles.data?.items ?? []).filter(r => r.name.toLowerCase().includes(search.toLowerCase())).map(r => ({ id: String(r.id), name: r.name, userCount: r.users_count ?? r.admins_count ?? 0, isActive: activeOf(r as Role & { is_active?: boolean | number }) })), [roles.data, search]);
  const currentError = admins.error ?? roles.error ?? permissions.error;
  const findAdmin = (id: string) => admins.data?.items.find(item => String(item.id) === id); const findRole = (id: string) => roles.data?.items.find(item => String(item.id) === id);
  const adminLabels = { createTitle: t("adminsPage.dialogs.adminForm.createTitle"), editTitle: t("adminsPage.dialogs.adminForm.editTitle"), activation: t("adminsPage.dialogs.adminForm.activation"), active: t("adminsPage.dialogs.adminForm.active"), name: t("adminsPage.dialogs.adminForm.name"), namePlaceholder: t("adminsPage.dialogs.adminForm.namePlaceholder"), role: t("adminsPage.dialogs.adminForm.role"), email: t("adminsPage.dialogs.adminForm.email"), emailPlaceholder: t("adminsPage.dialogs.adminForm.emailPlaceholder"), phoneNumber: t("adminsPage.dialogs.adminForm.phoneNumber"), phonePlaceholder: t("adminsPage.dialogs.adminForm.phonePlaceholder"), password: t("adminsPage.dialogs.adminForm.password"), passwordPlaceholder: t("adminsPage.dialogs.adminForm.passwordPlaceholder"), confirmPassword: t("adminsPage.dialogs.adminForm.confirmPassword"), confirmPasswordPlaceholder: t("adminsPage.dialogs.adminForm.confirmPasswordPlaceholder"), cancel: t("adminsPage.dialogs.adminForm.cancel"), confirm: t("adminsPage.dialogs.adminForm.confirm") };
  const close = () => setDialog(null);
  return <div className="space-y-6 px-4 py-8 lg:px-8">
    <div><h1 className="text-3xl font-bold">{t("adminsPage.title")}</h1><p className="mt-2 text-lg font-medium text-muted-foreground">{t("adminsPage.subtitle")}</p></div>
    <div className="flex gap-2">{(["admins", "roles"] as Tab[]).filter((key) => key === "admins" ? canViewAdmins : canViewRoles).map(key => <button type="button" key={key} onClick={() => { setTab(key); setDialog(null); setSelectedAdmin(undefined); setSelectedRole(undefined); setSearch(""); }} className={cn("h-9 rounded-full px-5 text-sm", tab === key ? "bg-primary text-white" : "border bg-card")}>{t(`adminsPage.tabs.${key}` as Parameters<typeof t>[0])}</button>)}</div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><SearchInput label={t("adminsPage.search.label")} placeholder={t("adminsPage.search.placeholder")} value={search} onChange={e => setSearch(e.target.value)} className="max-w-[380px]"/>{tab === "roles" ? canCreateRole ? <Button type="button" className="gap-2 text-white" onClick={() => { setSelectedRole(undefined); setDialog("role"); }}><AddIcon className="size-4"/>{t("adminsPage.dialogs.roleForm.title")}</Button> : null : canCreateAdmin ? <Button type="button" className="gap-2 text-white" onClick={() => { setSelectedAdmin(undefined); setDialog("admin"); }}><AddIcon className="size-4"/>{t("adminsPage.actions.addNew")}</Button> : null}</div>
    {currentError && <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">{normalizeApiError(currentError).message}</p>}
    {tab === "admins" ? <AdminsTable rows={adminRows} labels={{ adminName:t("adminsPage.table.columns.adminName"), phoneNumber:t("adminsPage.table.columns.phoneNumber"), email:t("adminsPage.table.columns.email"), role:t("adminsPage.table.columns.role"), status:t("adminsPage.table.columns.status"), action:t("adminsPage.table.columns.action"), toggleStatus:t("adminsPage.table.actions.toggleStatus"), delete:t("adminsPage.table.actions.delete"), edit:t("adminsPage.table.actions.edit") }} onEdit={id => { setSelectedAdmin(findAdmin(id)); setDialog("admin"); }} onDelete={id => { setSelectedAdmin(findAdmin(id)); setDialog("delete-admin"); }}/>:<RolesTable rows={roleRows} labels={{ roleName:t("adminsPage.table.columns.roleName"), numberOfUsers:t("adminsPage.table.columns.numberOfUsers"), status:t("adminsPage.table.columns.status"), action:t("adminsPage.table.columns.action"), toggleStatus:t("adminsPage.table.actions.toggleStatus"), delete:t("adminsPage.table.actions.deleteRole"), edit:t("adminsPage.table.actions.editRole") }} onEdit={id => { setSelectedRole(findRole(id)); setDialog("role"); }} onDelete={id => { setSelectedRole(findRole(id)); setDialog("delete-role"); }}/>} 
    <AdminFormDialog isOpen={dialog === "admin"} mode={selectedAdmin ? "edit" : "create"} admin={selectedAdmin} roles={roles.data?.items ?? []} labels={adminLabels} onClose={close} onSubmit={payload => selectedAdmin ? updateAdmin.mutateAsync({ id:selectedAdmin.id, payload }) : createAdmin.mutateAsync(payload)}/>
    <RoleFormDialog isOpen={dialog === "role"} role={selectedRole} permissions={permissions.data ?? []} labels={{ title:t("adminsPage.dialogs.roleForm.title"), activation:t("adminsPage.dialogs.roleForm.activation"), active:t("adminsPage.dialogs.roleForm.active"), role:t("adminsPage.dialogs.roleForm.role"), permission:t("adminsPage.dialogs.roleForm.permission"), cancel:t("adminsPage.dialogs.roleForm.cancel"), confirm:t("adminsPage.dialogs.roleForm.confirm") }} onClose={close} onSubmit={payload => selectedRole ? updateRole.mutateAsync({ id:selectedRole.id, payload }) : createRole.mutateAsync(payload)}/>
    <DeleteConfirmDialog isOpen={dialog === "delete-admin"} title={t("adminsPage.dialogs.deleteAdmin.title")} descriptionLine1={t("adminsPage.dialogs.deleteAdmin.descriptionLine1", { name:selectedAdmin?.name ?? "" })} descriptionLine2={t("adminsPage.dialogs.deleteAdmin.descriptionLine2")} cancelLabel={t("adminsPage.dialogs.deleteAdmin.cancel")} confirmLabel={t("adminsPage.dialogs.deleteAdmin.confirm")} onClose={close} onConfirm={() => selectedAdmin && removeAdmin.mutateAsync(selectedAdmin.id).then(close)} isPending={removeAdmin.isPending} errorMessage={removeAdmin.error ? normalizeApiError(removeAdmin.error).message : undefined}/>
    <DeleteConfirmDialog isOpen={dialog === "delete-role"} title={t("adminsPage.dialogs.deleteRole.title")} descriptionLine1={t("adminsPage.dialogs.deleteRole.descriptionLine1", { name:selectedRole?.name ?? "" })} descriptionLine2={t("adminsPage.dialogs.deleteRole.descriptionLine2")} cancelLabel={t("adminsPage.dialogs.deleteRole.cancel")} confirmLabel={t("adminsPage.dialogs.deleteRole.confirm")} onClose={close} onConfirm={() => selectedRole && removeRole.mutateAsync(selectedRole.id).then(close)} isPending={removeRole.isPending} errorMessage={removeRole.error ? normalizeApiError(removeRole.error).message : undefined}/>
  </div>;
}
