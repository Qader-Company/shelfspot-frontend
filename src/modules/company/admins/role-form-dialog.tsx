"use client";

import { useState } from "react";
import { StatusToggle } from "@/shared/components/dashboard/status-toggle";
import { formatApiError } from "@/shared/lib/api/errors";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type { Permission, Role } from "./access-control-api";

interface Props { isOpen: boolean; role?: Role; permissions: Permission[]; labels: Record<string, string>; onClose: () => void; onSubmit: (payload: Record<string, unknown>) => Promise<unknown>; }
export function RoleFormDialog({ isOpen, role, permissions, labels, onClose, onSubmit }: Props) {
  if (!isOpen) return null;
  return <RoleFormContent role={role} permissions={permissions} labels={labels} onClose={onClose} onSubmit={onSubmit} />;
}

function RoleFormContent({ role, permissions, labels, onClose, onSubmit }: Omit<Props, "isOpen">) {
  const [name, setName] = useState(role?.name ?? ""); const [active, setActive] = useState(Boolean(role?.active ?? role?.is_active ?? true)); const [selected, setSelected] = useState<string[]>(role?.permissions?.map(p => p.name) ?? []); const [pending, setPending] = useState(false); const [error, setError] = useState("");
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setPending(true); setError(""); try { await onSubmit({ name: name.trim(), is_active: active ? 1 : 0, permissions: selected }); onClose(); } catch(e) { setError(formatApiError(e)); } finally { setPending(false); } };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"><section role="dialog" aria-modal="true" className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-card p-5 shadow-xl sm:p-8"><h2 className="text-center text-2xl font-bold">{labels.title}</h2><form onSubmit={submit}><div className="mt-6 space-y-5">
    <button type="button" className="flex items-center gap-3" onClick={() => setActive(v => !v)}><span className="text-sm font-medium">{labels.activation}</span><StatusToggle isActive={active} ariaLabel={labels.activation}/><span className="text-sm text-muted-foreground">{labels.active}</span></button>
    <label className="block space-y-1.5 text-sm font-medium"><span>{labels.role}</span><Input value={name} onChange={e => setName(e.target.value)} required/></label>
    <div><p className="mb-3 text-sm font-medium">{labels.permission}</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{permissions.map(p => <label key={p.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(p.name)} onChange={() => setSelected(s => s.includes(p.name) ? s.filter(name => name !== p.name) : [...s, p.name])}/>{p.name}</label>)}</div></div>
    {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
  </div><div className="mt-7 flex gap-4"><Button type="button" variant="outline" className="h-11 flex-1" onClick={onClose} disabled={pending}>{labels.cancel}</Button><Button type="submit" className="h-11 flex-1 text-white" disabled={pending}>{labels.confirm}</Button></div></form></section></div>;
}
