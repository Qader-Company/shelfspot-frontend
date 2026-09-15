"use client";

import { useState } from "react";
import { Dialog } from "radix-ui";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { formatApiError } from "@/shared/lib/api/errors";
import { CompanySummary } from "./company-summary";
import type { AdminCompany } from "./types";

// Normalize API records before presenting them in the management view.
export interface CompanyUser {
  id: string; name: string; phone: string; email: string;
  roleId: string; roleName: string; active: boolean; roles: string[]; owner: boolean;
}
export interface CompanyUserInput { name: string; phone: string; email: string; roleId: string; active: boolean; password?: string }
interface Props {
  company: AdminCompany;
  filters: { search: string; role: string; is_active: string };
  onFilter: (key: "search" | "role" | "is_active", value: string) => void;
  loading?: boolean;
  users: CompanyUser[];
  roles: { id: string; name: string }[];
  onLoad: (id: string) => Promise<CompanyUser>;
  onSave: (input: CompanyUserInput, id?: string, existingRoles?: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (user: CompanyUser) => Promise<void>;
}

export function CompanyUsersView({ company, users, roles, filters, onFilter, loading, onLoad, onSave, onDelete, onToggle }: Props) {
  const t = useTranslations("companyUsers");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<CompanyUser | null | undefined>();
  const [deleting, setDeleting] = useState<CompanyUser | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const filtered = users;
  const lastPage = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, lastPage);
  async function mutate(action: () => Promise<void>) {
    setPending(true); setError("");
    try { await action(); } catch (cause) { setError(formatApiError(cause)); } finally { setPending(false); }
  }
  return <div className="@container min-w-0 max-w-full space-y-6 px-4 py-6 sm:py-8 lg:px-8">
    <header><h1 className="break-words text-2xl font-bold leading-tight sm:text-3xl">{t("title")}</h1><p className="mt-2 text-base text-muted-foreground sm:text-lg">{t("subtitle")}</p></header>
    <CompanySummary item={company} />
    <div className="grid min-w-0 grid-cols-1 items-center gap-3 @min-[28rem]:grid-cols-3 @min-[48rem]:grid-cols-[minmax(0,1fr)_minmax(0,9rem)_minmax(0,9rem)_auto]">
      <label className="relative min-w-0 @min-[28rem]:col-span-3 @min-[48rem]:col-span-1"><Search className="absolute start-3 top-3 size-5 text-muted-foreground" /><Input aria-label={t("search")} placeholder={t("search")} value={filters.search} onChange={e => { onFilter("search", e.target.value); setPage(1); }} className="h-11 ps-10" /></label>
      <select aria-label={t("status")} value={filters.is_active} onChange={e => { onFilter("is_active", e.target.value); setPage(1); }} className="h-11 w-full min-w-0 rounded-lg border border-border bg-card px-3"><option value="">{t("allStatuses")}</option><option value="1">{t("active")}</option><option value="0">{t("inactive")}</option></select>
      <select aria-label={t("role")} value={filters.role} onChange={e => { onFilter("role", e.target.value); setPage(1); }} className="h-11 w-full min-w-0 rounded-lg border border-border bg-card px-3"><option value="">{t("allRoles")}</option>{roles.map(role => <option key={role.id} value={role.name}>{role.name}</option>)}</select>
      <Button className="h-11 w-full whitespace-nowrap px-4" disabled={pending} onClick={() => setEditing(null)}><Plus className="size-4" />{t("add")}</Button>
    </div>
    {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    <div className="min-w-0 max-w-full overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b border-border">{["name", "phone", "email", "role", "status", "actions"].map(key => <th key={key} className="whitespace-nowrap px-6 py-4 text-start font-medium text-muted-foreground">{t(key)}</th>)}</tr></thead><tbody>
      {filtered.slice((current - 1) * 10, current * 10).map(user => <tr key={user.id} className="border-b border-border last:border-0"><td className="px-6 py-6 font-medium">{user.name}</td><td className="px-6 py-6"><bdi>{user.phone || "\u2014"}</bdi></td><td className="px-6 py-6"><bdi>{user.email}</bdi></td><td className="px-6 py-6">{user.roleName}</td><td className="px-6 py-6"><button type="button" role="switch" aria-checked={user.active} aria-label={t("toggle", { name: user.name })} disabled={pending} onClick={() => void mutate(() => onToggle(user))} className={"relative h-5 w-9 rounded-full disabled:opacity-50 " + (user.active ? "bg-success" : "bg-muted")}><span className={"absolute top-0.5 size-4 rounded-full bg-white " + (user.active ? "end-0.5" : "start-0.5")} /></button></td><td className="px-6 py-6"><div className="flex gap-2"><Button variant="ghost" size="icon-sm" disabled={pending} aria-label={t("delete")} onClick={() => { setError(""); setDeleting(user); }}><Trash2 className="size-4" /></Button><Button variant="ghost" size="icon-sm" disabled={pending} aria-label={t("edit")} onClick={() => void mutate(async () => setEditing(await onLoad(user.id)))}><Pencil className="size-4" /></Button></div></td></tr>)}
      {!filtered.length ? <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">{t(loading ? "loading" : "empty")}</td></tr> : null}
    </tbody></table></div>
    {lastPage > 1 ? <nav aria-label={t("pagination")} className="flex items-center justify-between"><Button variant="outline" disabled={current === 1} onClick={() => setPage(current - 1)}>{t("previous")}</Button><span className="rounded-lg bg-primary/10 px-4 py-2 text-primary">{current} / {lastPage}</span><Button variant="outline" disabled={current === lastPage} onClick={() => setPage(current + 1)}>{t("next")}</Button></nav> : null}
    {editing !== undefined ? <UserForm key={editing?.id ?? "new"} user={editing} roles={roles} onClose={() => setEditing(undefined)} onSave={onSave} /> : null}
    <DeleteConfirmDialog isOpen={Boolean(deleting)} title={t("deleteTitle")} descriptionLine1={t("deleteDescription", { name: deleting?.name ?? "" })} descriptionLine2={t("warning")} cancelLabel={t("keep")} confirmLabel={t("deleteConfirm")} isPending={pending} errorMessage={error || undefined} onClose={() => { if (!pending) setDeleting(null); }} onConfirm={() => { if (deleting) void mutate(async () => { await onDelete(deleting.id); setDeleting(null); }); }} />
  </div>;
}

function UserForm({ user, roles, onClose, onSave }: { user: CompanyUser | null; roles: Props["roles"]; onClose: () => void; onSave: Props["onSave"] }) {
  const t = useTranslations("companyUsers");
  const [form, setForm] = useState<CompanyUserInput>({ name: user?.name ?? "", phone: user?.phone ?? "", email: user?.email ?? "", roleId: user?.roleId ?? "", active: user?.active ?? true, password: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return <Dialog.Root open onOpenChange={open => { if (!open && !pending) onClose(); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/25" /><Dialog.Content aria-describedby={undefined} className="fixed start-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-card p-6 shadow-xl sm:p-8 rtl:translate-x-1/2"><Dialog.Title className="text-center text-2xl font-bold">{t(user ? "editTitle" : "createTitle")}</Dialog.Title><Dialog.Close disabled={pending} aria-label={t("close")} className="absolute end-5 top-5"><X className="size-5" /></Dialog.Close>
    <form className="mt-7 space-y-5" onSubmit={async event => { event.preventDefault(); setPending(true); setError(""); try { await onSave({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() }, user?.id, user?.roleId === form.roleId ? user.roles : undefined); onClose(); } catch (cause) { setError(formatApiError(cause)); } finally { setPending(false); } }}>
      <fieldset disabled={pending} className="space-y-5"><div className="flex items-center gap-3"><button type="button" role="switch" aria-checked={form.active} aria-label={t("status")} onClick={() => setForm({ ...form, active: !form.active })} className={"relative h-6 w-10 rounded-full " + (form.active ? "bg-primary" : "bg-muted")}><span className={"absolute top-1 size-4 rounded-full bg-white " + (form.active ? "end-1" : "start-1")} /></button><span>{t(form.active ? "active" : "inactive")}</span></div>
      {(["name", "email"] as const).map(key => <label key={key} className="block space-y-2 text-sm font-medium"><span>{t(key)}</span><Input required type={key === "email" ? "email" : "text"} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className="h-12 border-0 bg-muted/60" /></label>)}
      {!user ? <label className="block space-y-2 text-sm font-medium"><span>{t("password")}</span><Input required minLength={8} autoComplete="new-password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="h-12 border-0 bg-muted/60" /></label> : null}
      <label className="block space-y-2 text-sm font-medium"><span>{t("role")}</span><select required value={form.roleId} onChange={e => setForm({ ...form, roleId: e.target.value })} className="h-12 w-full rounded-lg bg-muted/60 px-3"><option value="">{t("selectRole")}</option>{roles.map(role => <option key={role.id} value={role.name}>{role.name}</option>)}</select></label></fieldset>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}<div className="grid grid-cols-2 gap-4"><Button type="button" variant="outline" disabled={pending} onClick={onClose} className="h-12 border-primary text-primary">{t("cancel")}</Button><Button type="submit" disabled={pending || !roles.length || !form.name.trim()} className="h-12">{t("confirm")}</Button></div>
    </form>
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
