"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";

import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { StatusToggle } from "@/shared/components/dashboard/status-toggle";
import {
  EmptyState,
  ErrorState,
  PageLoadingSkeleton,
} from "@/shared/components/feedback";
import { FlowDialog } from "@/shared/components/flow-dialog";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { useAccessControl } from "./hooks";
import {
  adminSchema,
  roleSchema,
  type AdminForm,
  type RoleForm,
} from "./schemas";
import type {
  Admin,
  AdminPayload,
  Permission,
  Role,
  RolePayload,
} from "./types";

type Tab = "admins" | "roles";
type Modal = "admin" | "role" | "deleteAdmin" | "deleteRole" | null;
type FeedbackKey =
  | "adminCreated"
  | "adminUpdated"
  | "adminDeleted"
  | "roleCreated"
  | "roleUpdated"
  | "roleDeleted";

const active = (x: Admin | Role) => Boolean(x.active ?? x.is_active);
const roleName = (x: Admin) => {
  if (typeof x.role === "string") return x.role;
  if (x.role?.name) return x.role.name;
  const first = x.roles?.[0];
  if (typeof first === "string") return first;
  if (first?.name) return first.name;
  return "\u2014";
};

export function AdminsPage() {
  const t = useTranslations("adminAdmins");
  const api = useAccessControl();
  const [tab, setTab] = useState<Tab>("admins");
  const [modal, setModal] = useState<Modal>(null);
  const [admin, setAdmin] = useState<Admin>();
  const [role, setRole] = useState<Role>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState<FeedbackKey | null>(null);
  const [failure, setFailure] = useState<{
    key: FeedbackKey;
    message: string;
  } | null>(null);

  const rows = useMemo(
    () =>
      (tab === "admins"
        ? api.admins.data?.items
        : api.roles.data?.items) ?? [],
    [tab, api.admins.data?.items, api.roles.data?.items],
  );
  const filtered = useMemo(
    () =>
      rows.filter(
        (x) =>
          x.name.toLowerCase().includes(search.toLowerCase()) &&
          (status === "all" || active(x) === (status === "active")),
      ),
    [rows, search, status],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const visible = filtered.slice((page - 1) * 8, page * 8);
  const query = tab === "admins" ? api.admins : api.roles;

  const close = () => {
    setModal(null);
    setNotice("");
  };

  const toggleAdmin = async (x: Admin) => {
    const r = roleName(x);
    if (r === "\u2014") return setNotice(t("errors.noRole"));
    await api.updateAdmin.mutateAsync({
      id: x.id,
      payload: {
        name: x.name,
        email: x.email,
        is_active: active(x) ? 0 : 1,
        roles: [r],
      },
    });
  };

  async function saveAdmin(payload: AdminPayload) {
    const key: FeedbackKey = admin ? "adminUpdated" : "adminCreated";
    try {
      if (admin) {
        await api.updateAdmin.mutateAsync({ id: admin.id, payload });
      } else {
        await api.createAdmin.mutateAsync(payload);
      }
      close();
      setSuccess(key);
    } catch (error) {
      setFailure({ key, message: normalizeApiError(error).message });
    }
  }

  async function saveRole(payload: RolePayload) {
    const key: FeedbackKey = role ? "roleUpdated" : "roleCreated";
    try {
      if (role) {
        await api.updateRole.mutateAsync({ id: role.id, payload });
      } else {
        await api.createRole.mutateAsync(payload);
      }
      close();
      setSuccess(key);
    } catch (error) {
      setFailure({ key, message: normalizeApiError(error).message });
    }
  }

  async function removeAdmin() {
    if (!admin) return;
    try {
      await api.deleteAdmin.mutateAsync(admin.id);
      close();
      setSuccess("adminDeleted");
    } catch (error) {
      close();
      setFailure({
        key: "adminDeleted",
        message: normalizeApiError(error).message,
      });
    }
  }

  async function removeRole() {
    if (!role) return;
    try {
      await api.deleteRole.mutateAsync(role.id);
      close();
      setSuccess("roleDeleted");
    } catch (error) {
      close();
      setFailure({
        key: "roleDeleted",
        message: normalizeApiError(error).message,
      });
    }
  }

  return (
    <main className="space-y-7 px-4 py-8 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="inline-flex rounded-2xl bg-muted p-2">
        {(["admins", "roles"] as Tab[]).map((x) => (
          <button
            type="button"
            key={x}
            onClick={() => {
              setTab(x);
              setPage(1);
              setSearch("");
            }}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold",
              tab === x
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground",
            )}
          >
            {t(`tabs.${x}`)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:justify-between">
        <SearchInput
          label={t("searchLabel")}
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-md"
        />
        <div className="flex gap-3">
          <select
            aria-label={t("statusLabel")}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-lg border bg-card px-4"
          >
            <option value="all">{t("statuses.all")}</option>
            <option value="active">{t("statuses.active")}</option>
            <option value="inactive">{t("statuses.inactive")}</option>
          </select>
          <Button
            className="h-11"
            onClick={() => {
              if (tab === "admins") setAdmin(undefined);
              else setRole(undefined);
              setModal(tab === "admins" ? "admin" : "role");
            }}
          >
            <Plus />
            {t(tab === "admins" ? "actions.addAdmin" : "actions.addRole")}
          </Button>
        </div>
      </div>

      {notice ? (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">
          {notice}
        </p>
      ) : null}

      {query.isPending ? (
        <PageLoadingSkeleton
          showHeader={false}
          cardCount={0}
          tableRows={8}
          tableColumns={tab === "admins" ? 6 : 4}
          label={t("states.loading")}
        />
      ) : query.isError ? (
        <ErrorState
          title={t("states.error")}
          description={normalizeApiError(query.error).message}
          retryLabel={t("states.retry")}
          onRetry={() => void query.refetch()}
        />
      ) : !visible.length ? (
        <EmptyState
          title={t("states.empty")}
          description={t("states.emptyDescription")}
        />
      ) : (
        <Table
          tab={tab}
          rows={visible}
          t={t}
          onEdit={(x) => {
            if (tab === "admins") setAdmin(x as Admin);
            else setRole(x as Role);
            setModal(tab === "admins" ? "admin" : "role");
          }}
          onDelete={(x) => {
            if (tab === "admins") setAdmin(x as Admin);
            else setRole(x as Role);
            setModal(tab === "admins" ? "deleteAdmin" : "deleteRole");
          }}
          onToggle={(x) =>
            tab === "admins"
              ? void toggleAdmin(x as Admin).catch((e) =>
                  setNotice(normalizeApiError(e).message),
                )
              : setNotice(t("errors.roleStatus"))
          }
        />
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeft className="rtl:rotate-180" />
          {t("pagination.previous")}
        </Button>
        <span>{t("pagination.page", { page, pages })}</span>
        <Button
          variant="outline"
          disabled={page === pages}
          onClick={() => setPage(page + 1)}
        >
          {t("pagination.next")}
          <ChevronRight className="rtl:rotate-180" />
        </Button>
      </div>

      <AdminDialog
        open={modal === "admin"}
        admin={admin}
        roles={api.roles.data?.items ?? []}
        t={t}
        onClose={close}
        onSave={saveAdmin}
        isPending={api.createAdmin.isPending || api.updateAdmin.isPending}
      />
      <RoleDialog
        open={modal === "role"}
        role={role}
        permissions={api.permissions.data ?? []}
        t={t}
        onClose={close}
        onSave={saveRole}
        isPending={api.createRole.isPending || api.updateRole.isPending}
      />
      <DeleteConfirmDialog
        isOpen={modal === "deleteAdmin"}
        title={t("deleteAdmin.title")}
        descriptionLine1={t("deleteAdmin.description", {
          name: admin?.name ?? "",
        })}
        descriptionLine2={t("delete.warning")}
        cancelLabel={t("delete.cancel")}
        confirmLabel={t("delete.confirm")}
        onClose={close}
        onConfirm={() => void removeAdmin()}
        isPending={api.deleteAdmin.isPending}
      />
      <DeleteConfirmDialog
        isOpen={modal === "deleteRole"}
        title={t("deleteRole.title")}
        descriptionLine1={t("deleteRole.description", {
          name: role?.name ?? "",
        })}
        descriptionLine2={t("delete.warning")}
        cancelLabel={t("delete.cancel")}
        confirmLabel={t("delete.confirm")}
        onClose={close}
        onConfirm={() => void removeRole()}
        isPending={api.deleteRole.isPending}
      />

      <FlowDialog
        isOpen={Boolean(success)}
        onClose={() => setSuccess(null)}
        title={t(`success.${success ?? "adminCreated"}.title`)}
        closeLabel={t("success.close")}
        className="max-w-md text-center"
        footer={
          <Button className="w-full" onClick={() => setSuccess(null)}>
            {t("success.done")}
          </Button>
        }
      >
        <CheckCircle2 className="mx-auto size-14 text-success" />
        <p className="mt-4 text-muted-foreground">
          {t(`success.${success ?? "adminCreated"}.description`)}
        </p>
      </FlowDialog>

      <FlowDialog
        isOpen={Boolean(failure)}
        onClose={() => setFailure(null)}
        title={t(`failure.${failure?.key ?? "adminCreated"}.title`)}
        closeLabel={t("failure.close")}
        className="max-w-md text-center"
        footer={
          <Button className="w-full" onClick={() => setFailure(null)}>
            {t("failure.done")}
          </Button>
        }
      >
        <XCircle className="mx-auto size-14 text-destructive" />
        <p className="mt-4 text-muted-foreground">
          {t(`failure.${failure?.key ?? "adminCreated"}.description`)}
        </p>
        {failure?.message ? (
          <p
            className="mt-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {failure.message}
          </p>
        ) : null}
      </FlowDialog>
    </main>
  );
}

function Table({
  tab,
  rows,
  t,
  onEdit,
  onDelete,
  onToggle,
}: {
  tab: Tab;
  rows: (Admin | Role)[];
  t: ReturnType<typeof useTranslations<"adminAdmins">>;
  onEdit: (x: Admin | Role) => void;
  onDelete: (x: Admin | Role) => void;
  onToggle: (x: Admin | Role) => void;
}) {
  const headers =
    tab === "admins"
      ? ["name", "phone", "email", "role", "status", "action"]
      : ["role", "users", "status", "action"];

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                className="border-b border-e p-4 text-start font-medium last:border-e-0"
                key={h}
              >
                {t(`columns.${h}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((x) => (
            <tr className="border-b last:border-0" key={x.id}>
              <td className="p-5">{x.name}</td>
              {tab === "admins" ? (
                <>
                  <td className="p-5 text-muted-foreground">
                    {(x as Admin).phone ?? (x as Admin).phone_number ?? "\u2014"}
                  </td>
                  <td className="p-5 text-muted-foreground">
                    {(x as Admin).email}
                  </td>
                  <td className="p-5 text-muted-foreground">
                    {roleName(x as Admin)}
                  </td>
                </>
              ) : (
                <td className="p-5 text-muted-foreground">
                  {(x as Role).users_count ?? (x as Role).admins_count ?? 0}
                </td>
              )}
              <td className="p-5">
                <button aria-label={t("actions.toggle")} onClick={() => onToggle(x)}>
                  <StatusToggle
                    isActive={active(x)}
                    ariaLabel={t("actions.toggle")}
                  />
                </button>
              </td>
              <td className="p-5">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("actions.delete")}
                    onClick={() => onDelete(x)}
                  >
                    <Trash2 />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("actions.edit")}
                    onClick={() => onEdit(x)}
                  >
                    <Pencil />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Shell({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-card p-6 shadow-xl sm:p-8"
      >
        <h2 className="text-center text-2xl font-bold">{title}</h2>
        {children}
        <button className="sr-only" onClick={onClose}>
          close
        </button>
      </section>
    </div>
  );
}

function AdminDialog({
  open,
  admin,
  roles,
  t,
  onClose,
  onSave,
  isPending,
}: {
  open: boolean;
  admin?: Admin;
  roles: Role[];
  t: ReturnType<typeof useTranslations<"adminAdmins">>;
  onClose: () => void;
  onSave: (p: AdminPayload) => Promise<void>;
  isPending: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const f = useForm<AdminForm>({
    resolver: zodResolver(
      adminSchema(
        {
          required: t("validation.required"),
          email: t("validation.email"),
          password: t("validation.password"),
          match: t("validation.match"),
        },
        !!admin,
      ),
    ),
    values: {
      name: admin?.name ?? "",
      email: admin?.email ?? "",
      role: admin ? roleName(admin).replace("\u2014", "") : "",
      password: "",
      active: admin ? active(admin) : true,
    },
  });

  return (
    <Shell
      open={open}
      title={t(admin ? "adminForm.editTitle" : "adminForm.createTitle")}
      onClose={onClose}
    >
      <form
        className="mt-7 space-y-4"
        onSubmit={f.handleSubmit((v) =>
          onSave({
            name: v.name,
            email: v.email,
            ...(v.password ? { password: v.password } : {}),
            is_active: v.active ? 1 : 0,
            roles: [v.role],
          }),
        )}
      >
        <Toggle
          value={f.watch("active")}
          onClick={() => f.setValue("active", !f.getValues("active"))}
          label={t("adminForm.activation")}
        />
        <Field label={t("adminForm.name")} error={f.formState.errors.name?.message}>
          <Input {...f.register("name")} placeholder="Omnia Arafat" />
        </Field>
        <Field label={t("adminForm.role")} error={f.formState.errors.role?.message}>
          <select
            {...f.register("role")}
            className="h-11 w-full rounded-lg border bg-muted px-3"
          >
            <option value="">{t("adminForm.selectRole")}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("adminForm.email")} error={f.formState.errors.email?.message}>
          <Input {...f.register("email")} type="email" placeholder="ex@gmail.com" />
        </Field>
        <Field
          label={t("adminForm.password")}
          error={f.formState.errors.password?.message}
        >
          <PasswordInput
            visible={showPassword}
            onToggle={() => setShowPassword((value) => !value)}
            placeholder={t("adminForm.password")}
            registration={f.register("password")}
          />
        </Field>
        <Actions t={t} onClose={onClose} isPending={isPending} />
      </form>
    </Shell>
  );
}

function PasswordInput({
  visible,
  onToggle,
  placeholder,
  registration,
}: {
  visible: boolean;
  onToggle: () => void;
  placeholder: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <span className="relative block">
      <Input
        {...registration}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        className="pe-11"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <Image
            src="/auth/icons/view-off.svg"
            alt=""
            aria-hidden="true"
            width={18}
            height={18}
            className="size-[18px]"
          />
        ) : (
          <Eye className="size-[18px]" />
        )}
      </button>
    </span>
  );
}

function RoleDialog({
  open,
  role,
  permissions,
  t,
  onClose,
  onSave,
  isPending,
}: {
  open: boolean;
  role?: Role;
  permissions: Permission[];
  t: ReturnType<typeof useTranslations<"adminAdmins">>;
  onClose: () => void;
  onSave: (p: RolePayload) => Promise<void>;
  isPending: boolean;
}) {
  const f = useForm<RoleForm>({
    resolver: zodResolver(roleSchema(t("validation.required"))),
    values: {
      name: role?.name ?? "",
      permissions: role?.permissions?.map((p) => p.name) ?? [],
      active: role ? active(role) : true,
    },
  });
  const selected = f.watch("permissions");

  return (
    <Shell
      open={open}
      title={t(role ? "roleForm.editTitle" : "roleForm.createTitle")}
      onClose={onClose}
    >
      <form
        className="mt-7 space-y-5"
        onSubmit={f.handleSubmit((v) =>
          onSave({ name: v.name, permissions: v.permissions }),
        )}
      >
        <Toggle
          value={f.watch("active")}
          onClick={() => setTimeout(() => {}, 0)}
          label={t("adminForm.activation")}
        />
        <Field label={t("roleForm.name")} error={f.formState.errors.name?.message}>
          <Input {...f.register("name")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {permissions.map((p) => (
            <label className="flex items-center gap-2 text-sm" key={p.id}>
              <input
                type="checkbox"
                checked={selected.includes(p.name)}
                onChange={() =>
                  f.setValue(
                    "permissions",
                    selected.includes(p.name)
                      ? selected.filter((x) => x !== p.name)
                      : [...selected, p.name],
                  )
                }
              />
              {p.name}
            </label>
          ))}
        </div>
        <Actions t={t} onClose={onClose} isPending={isPending} />
      </form>
    </Shell>
  );
}

function Toggle({
  value,
  onClick,
  label,
}: {
  value: boolean;
  onClick: () => void;
  label: string;
}) {
  const t = useTranslations("adminAdmins");

  return (
    <div>
      <p className="mb-2 font-medium">{label}</p>
      <button type="button" className="flex items-center gap-3" onClick={onClick}>
        <StatusToggle isActive={value} ariaLabel={label} />
        <span>{t(value ? "statuses.active" : "statuses.inactive")}</span>
      </button>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2 font-medium">
      <span>{label}</span>
      {children}
      {error ? <small className="block text-destructive">{error}</small> : null}
    </label>
  );
}

function Actions({
  t,
  onClose,
  isPending,
}: {
  t: ReturnType<typeof useTranslations<"adminAdmins">>;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex gap-4 pt-2">
      <Button
        type="button"
        variant="outline"
        className="h-12 flex-1"
        onClick={onClose}
        disabled={isPending}
      >
        {t("actions.cancel")}
      </Button>
      <Button type="submit" className="h-12 flex-1" disabled={isPending}>
        {t("actions.confirm")}
      </Button>
    </div>
  );
}
