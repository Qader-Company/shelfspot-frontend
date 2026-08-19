"use client";

import { useState } from "react";
import { StatusToggle } from "@/shared/components/dashboard/status-toggle";
import { formatApiError } from "@/shared/lib/api/errors";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type { Admin, Role } from "./access-control-api";

export type AdminFormMode = "create" | "edit";
interface Props { isOpen: boolean; mode: AdminFormMode; admin?: Admin; roles: Role[]; labels: Record<string, string>; onClose: () => void; onSubmit: (payload: Record<string, unknown>) => Promise<unknown>; }

export function AdminFormDialog({ isOpen, mode, admin, roles, labels, onClose, onSubmit }: Props) {
  if (!isOpen) return null;
  return <AdminFormContent mode={mode} admin={admin} roles={roles} labels={labels} onClose={onClose} onSubmit={onSubmit} />;
}

function AdminFormContent({ mode, admin, roles, labels, onClose, onSubmit }: Omit<Props, "isOpen">) {
  const assignedRole = typeof admin?.roles === "string"
    ? admin.roles
    : Array.isArray(admin?.roles)
      ? admin.roles[0] ?? ""
      : typeof admin?.roles === "object" && admin.roles
        ? admin.roles.name
        : typeof admin?.role === "string"
          ? admin.role
          : admin?.role?.name ?? "";
  const [form, setForm] = useState({ name: admin?.name ?? "", role: assignedRole, email: admin?.email ?? "", phone: admin?.phone ?? admin?.phone_number ?? "", password: "", password_confirmation: "", is_active: Boolean(admin?.active ?? admin?.is_active ?? true) });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const set = (key: string, value: string | boolean) => setForm(value0 => ({ ...value0, [key]: value }));
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setPending(true); setError(""); try { const payload: Record<string, unknown> = { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), roles: [form.role], is_active: form.is_active ? 1 : 0 }; delete payload.role; if (mode === "edit" && !form.password) { delete payload.password; delete payload.password_confirmation; } await onSubmit(payload); onClose(); } catch (e) { setError(formatApiError(e)); } finally { setPending(false); } };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"><section role="dialog" aria-modal="true" className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-card p-5 shadow-xl sm:p-8">
    <h2 className="text-center text-2xl font-bold">{mode === "create" ? labels.createTitle : labels.editTitle}</h2>
    <form onSubmit={submit}><div className="mt-6 space-y-4">
      <button type="button" className="flex items-center gap-3" onClick={() => set("is_active", !form.is_active)}><span className="text-sm font-medium">{labels.activation}</span><StatusToggle isActive={form.is_active} ariaLabel={labels.activation}/><span className="text-sm text-muted-foreground">{labels.active}</span></button>
      <Field label={labels.name}><Input value={form.name} onChange={e => set("name", e.target.value)} placeholder={labels.namePlaceholder} required/></Field>
      <Field label={labels.role}><select value={form.role} onChange={e => set("role", e.target.value)} className="h-11 w-full rounded-lg border bg-secondary px-4" required><option value="">{labels.role}</option>{roles.map(role => <option key={role.id} value={role.name}>{role.name}</option>)}</select></Field>
      <Field label={labels.email}><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder={labels.emailPlaceholder} required/></Field>
      <Field label={labels.phoneNumber}><Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder={labels.phonePlaceholder} required/></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label={labels.password}><Input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder={labels.passwordPlaceholder} required={mode === "create"}/></Field><Field label={labels.confirmPassword}><Input type="password" value={form.password_confirmation} onChange={e => set("password_confirmation", e.target.value)} placeholder={labels.confirmPasswordPlaceholder} required={mode === "create" || Boolean(form.password)}/></Field></div>
      {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    </div><div className="mt-7 flex gap-4"><Button type="button" variant="outline" className="h-11 flex-1" onClick={onClose} disabled={pending}>{labels.cancel}</Button><Button type="submit" className="h-11 flex-1 text-white" disabled={pending}>{labels.confirm}</Button></div></form>
  </section></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block space-y-1.5 text-sm font-medium"><span>{label}</span>{children}</label>; }
