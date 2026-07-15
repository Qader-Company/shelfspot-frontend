"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  AddIcon,
  PaginationNextIcon,
  PaginationPreviousIcon,
  SidebarChevronIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import {
  adminRows,
  adminsDefaultTab,
  adminsPagination,
  roleRows,
} from "./admins.seed";
import type { AdminTabKey } from "./admins.seed";
import { AdminFormDialog } from "./admin-form-dialog";
import type { AdminFormMode } from "./admin-form-dialog";
import { AdminsTable } from "./admins-table";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { RoleFormDialog } from "./role-form-dialog";
import { RolesTable } from "./roles-table";

type DialogType =
  | "create-admin"
  | "edit-admin"
  | "delete-admin"
  | "create-role"
  | "edit-role"
  | "delete-role"
  | null;

const tabKeys: AdminTabKey[] = ["admins", "roles"];

export function AdminsPage() {
  const t = useTranslations("dashboard");
  const [activeTab, setActiveTab] = useState<AdminTabKey>(adminsDefaultTab);
  const [openDialog, setOpenDialog] = useState<DialogType>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  const close = () => setOpenDialog(null);

  const handleDeleteAdmin = (id: string) => {
    const row = adminRows.find((r) => r.id === id);
    setDeleteTargetName(row?.name ?? "");
    setOpenDialog("delete-admin");
  };

  const handleEditAdmin = () => setOpenDialog("edit-admin");

  const handleDeleteRole = (id: string) => {
    const row = roleRows.find((r) => r.id === id);
    setDeleteTargetName(row?.name ?? "");
    setOpenDialog("delete-role");
  };

  const handleEditRole = () => setOpenDialog("edit-role");

  const handleAddNew = () =>
    activeTab === "admins"
      ? setOpenDialog("create-admin")
      : setOpenDialog("create-role");

  // Resolve admin form dialog mode
  const adminFormMode: AdminFormMode =
    openDialog === "edit-admin" ? "edit" : "create";
  const isAdminFormOpen =
    openDialog === "create-admin" || openDialog === "edit-admin";
  const isRoleFormOpen =
    openDialog === "create-role" || openDialog === "edit-role";

  const adminFormLabels = {
    createTitle: t("adminsPage.dialogs.adminForm.createTitle"),
    editTitle: t("adminsPage.dialogs.adminForm.editTitle"),
    activation: t("adminsPage.dialogs.adminForm.activation"),
    active: t("adminsPage.dialogs.adminForm.active"),
    name: t("adminsPage.dialogs.adminForm.name"),
    namePlaceholder: t("adminsPage.dialogs.adminForm.namePlaceholder"),
    role: t("adminsPage.dialogs.adminForm.role"),
    email: t("adminsPage.dialogs.adminForm.email"),
    emailPlaceholder: t("adminsPage.dialogs.adminForm.emailPlaceholder"),
    phoneNumber: t("adminsPage.dialogs.adminForm.phoneNumber"),
    phonePlaceholder: t("adminsPage.dialogs.adminForm.phonePlaceholder"),
    password: t("adminsPage.dialogs.adminForm.password"),
    passwordPlaceholder: t("adminsPage.dialogs.adminForm.passwordPlaceholder"),
    confirmPassword: t("adminsPage.dialogs.adminForm.confirmPassword"),
    confirmPasswordPlaceholder: t(
      "adminsPage.dialogs.adminForm.confirmPasswordPlaceholder",
    ),
    cancel: t("adminsPage.dialogs.adminForm.cancel"),
    confirm: t("adminsPage.dialogs.adminForm.confirm"),
  };

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold leading-tight text-foreground">
          {t("adminsPage.title")}
        </h1>
        <p className="mt-2 text-lg font-medium text-muted-foreground">
          {t("adminsPage.subtitle")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2" role="tablist" aria-label={t("adminsPage.tabsLabel")}>
        {tabKeys.map((key) => {
          const isActive = key === activeTab;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(key)}
              className={cn(
                "h-9 rounded-full px-5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "border border-border bg-card text-foreground hover:bg-muted/50",
              )}
            >
              {t(`adminsPage.tabs.${key}` as Parameters<typeof t>[0])}
            </button>
          );
        })}
      </div>

      {/* Search + filter + add button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchInput
          label={t("adminsPage.search.label")}
          placeholder={t("adminsPage.search.placeholder")}
          className="max-w-[380px]"
        />
        <div className="flex items-center gap-3">
          {/* All Statuses filter */}
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-medium text-foreground shadow-none"
          >
            {t("adminsPage.filters.allStatuses")}
            <SidebarChevronIcon className="size-4" />
          </Button>

          {/* Add New admin */}
          <Button
            type="button"
            className="h-10 gap-2 rounded-lg px-4 text-sm font-semibold text-white hover:text-white"
            onClick={handleAddNew}
          >
            <AddIcon className="size-4" />
            {t("adminsPage.actions.addNew")}
          </Button>
        </div>
      </div>

      {/* Table */}
      {activeTab === "admins" ? (
        <AdminsTable
          rows={adminRows}
          labels={{
            adminName:    t("adminsPage.table.columns.adminName"),
            phoneNumber:  t("adminsPage.table.columns.phoneNumber"),
            email:        t("adminsPage.table.columns.email"),
            role:         t("adminsPage.table.columns.role"),
            status:       t("adminsPage.table.columns.status"),
            action:       t("adminsPage.table.columns.action"),
            toggleStatus: t("adminsPage.table.actions.toggleStatus"),
            delete:       t("adminsPage.table.actions.delete"),
            edit:         t("adminsPage.table.actions.edit"),
          }}
          onDelete={handleDeleteAdmin}
          onEdit={() => handleEditAdmin()}
        />
      ) : (
        <RolesTable
          rows={roleRows}
          labels={{
            roleName:     t("adminsPage.table.columns.roleName"),
            numberOfUsers: t("adminsPage.table.columns.numberOfUsers"),
            status:       t("adminsPage.table.columns.status"),
            action:       t("adminsPage.table.columns.action"),
            toggleStatus: t("adminsPage.table.actions.toggleStatus"),
            delete:       t("adminsPage.table.actions.deleteRole"),
            edit:         t("adminsPage.table.actions.editRole"),
          }}
          onDelete={handleDeleteRole}
          onEdit={() => handleEditRole()}
        />
      )}

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-4 px-5 pb-2 md:flex-row">
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none"
        >
          <PaginationPreviousIcon className="size-4 rtl:rotate-180" />
          {t("adminsPage.pagination.previous")}
        </Button>
        <div className="flex items-center gap-2">
          {adminsPagination.pages.map((page) => (
            <Button
              key={page}
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(
                "rounded-lg text-sm text-muted-foreground",
                page === adminsPagination.activePage &&
                  "bg-primary/20 text-foreground hover:bg-primary/20",
              )}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none"
        >
          {t("adminsPage.pagination.next")}
          <PaginationNextIcon className="size-4 rtl:rotate-180" />
        </Button>
      </div>

      {/* ── Dialogs ─────────────────────────────────────────────── */}

      {/* Delete Admin */}
      <DeleteConfirmDialog
        isOpen={openDialog === "delete-admin"}
        title={t("adminsPage.dialogs.deleteAdmin.title")}
        descriptionLine1={t("adminsPage.dialogs.deleteAdmin.descriptionLine1", {
          name: deleteTargetName,
        })}
        descriptionLine2={t("adminsPage.dialogs.deleteAdmin.descriptionLine2")}
        cancelLabel={t("adminsPage.dialogs.deleteAdmin.cancel")}
        confirmLabel={t("adminsPage.dialogs.deleteAdmin.confirm")}
        onClose={close}
      />

      {/* Delete Role */}
      <DeleteConfirmDialog
        isOpen={openDialog === "delete-role"}
        title={t("adminsPage.dialogs.deleteRole.title")}
        descriptionLine1={t("adminsPage.dialogs.deleteRole.descriptionLine1", {
          name: deleteTargetName,
        })}
        descriptionLine2={t("adminsPage.dialogs.deleteRole.descriptionLine2")}
        cancelLabel={t("adminsPage.dialogs.deleteRole.cancel")}
        confirmLabel={t("adminsPage.dialogs.deleteRole.confirm")}
        onClose={close}
      />

      {/* Create / Update Admin */}
      <AdminFormDialog
        isOpen={isAdminFormOpen}
        mode={adminFormMode}
        labels={adminFormLabels}
        onClose={close}
      />

      {/* Create / Edit Role */}
      <RoleFormDialog
        isOpen={isRoleFormOpen}
        labels={{
          title:      t("adminsPage.dialogs.roleForm.title"),
          activation: t("adminsPage.dialogs.roleForm.activation"),
          active:     t("adminsPage.dialogs.roleForm.active"),
          role:       t("adminsPage.dialogs.roleForm.role"),
          permission: t("adminsPage.dialogs.roleForm.permission"),
          cancel:     t("adminsPage.dialogs.roleForm.cancel"),
          confirm:    t("adminsPage.dialogs.roleForm.confirm"),
        }}
        onClose={close}
      />
    </div>
  );
}
