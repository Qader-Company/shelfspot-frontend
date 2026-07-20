"use client";

import { useEffect, useState } from "react";
import { StatusToggle } from "@/shared/components/dashboard/status-toggle";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type { Permission, Role } from "./access-control-api";

interface Props { isOpen: boolean; role?: Role; permissions: Permission[]; labels: Record<string, string>; onClose: () => void; onSubmit: (payload: Record<string, unknown>) => Promise<unknown>; }
export function RoleFormDialog({ isOpen, role, permissions, labels, onClose, onSubmit }: Props) {
  const [name, setName] = useState(""); const [active, setActive] = useState(true); const [selected, setSelected] = useState<string[]>([]); const [pending, setPending] = useState(false); const [error, setError] = useState("");
  useEffect(() => { if (isOpen) { setName(role?.name ?? ""); setActive(role?.active ?? true); setSelected(role?.permissions?.map(p => String(p.id)) ?? []); setError(""); } }, [isOpen, role]);
  if (!isOpen) return null;
  const submit = async () => { setPending(true); setError(""); try { await onSubmit({ name, is_active: active ? 1 : 0, permissions: selected }); onClose(); } catch(e) { setError(normalizeApiError(e).message); } finally { setPending(false); } };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"><section role="dialog" aria-modal="true" className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-card p-5 shadow-xl sm:p-8"><h2 className="text-center text-2xl font-bold">{labels.title}</h2><div className="mt-6 space-y-5">
    <button type="button" className="flex items-center gap-3" onClick={() => setActive(v => !v)}><span className="text-sm font-medium">{labels.activation}</span><StatusToggle isActive={active} ariaLabel={labels.activation}/><span className="text-sm text-muted-foreground">{labels.active}</span></button>
    <label className="block space-y-1.5 text-sm font-medium"><span>{labels.role}</span><Input value={name} onChange={e => setName(e.target.value)}/></label>
    <div><p className="mb-3 text-sm font-medium">{labels.permission}</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{permissions.map(p => <label key={p.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(String(p.id))} onChange={() => setSelected(s => s.includes(String(p.id)) ? s.filter(id => id !== String(p.id)) : [...s, String(p.id)])}/>{p.name}</label>)}</div></div>
    {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
  </div><div className="mt-7 flex gap-4"><Button variant="outline" className="h-11 flex-1" onClick={onClose} disabled={pending}>{labels.cancel}</Button><Button className="h-11 flex-1 text-white" onClick={submit} disabled={pending}>{labels.confirm}</Button></div></section></div>;
}
