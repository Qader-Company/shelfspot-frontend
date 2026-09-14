"use client";

import { StoreMapDialog } from "./map-dialog";
import { useState } from "react";
import { Dialog } from "radix-ui";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { normalizeApiError } from "@/shared/lib/api/errors";
import type { Store, StoreInput } from "./types";

function StoreSwitch({ active, label, disabled, onChange }: { active: boolean; label: string; disabled?: boolean; onChange: () => void }) {
  return <button type="button" role="switch" aria-checked={active} aria-label={label} disabled={disabled} onClick={onChange} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${active ? "bg-success" : "bg-muted"}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow transition-all ${active ? "end-1" : "start-1"}`} /></button>;
}

export function StoresView({ stores, loading, error, onRetry, onSave, onDelete, onBulkDelete, onToggle, onLoad }: {
  stores: Store[];
  onLoad: (id: string) => Promise<Store>;
  onBulkDelete: (ids: string[]) => Promise<void>;
  loading?: boolean;
  error?: string;
  onRetry: () => void;
  onSave: (input: StoreInput, id?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (store: Store) => Promise<void>;
}) {
  const t = useTranslations("dashboard.stores");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Store | null | undefined>();
  const [deleting, setDeleting] = useState<Store | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulk, setBulk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const filtered = stores.filter(store => `${store.name} ${store.number} ${store.location} ${store.address}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()) && (status === "all" || store.active === (status === "active")));
  const last = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, last);
  const rows = filtered.slice((current - 1) * 10, current * 10);
  async function mutate(action: () => Promise<void>) {
    setBusy(true); setMutationError("");
    try { await action(); } catch (cause) { setMutationError(normalizeApiError(cause).message); } finally { setBusy(false); }
  }
  return <div className="space-y-6 px-4 py-8 lg:px-8">
    <h1 className="text-3xl font-bold">{t("title")}</h1>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="relative w-full max-w-md"><Search className="absolute start-3 top-3 size-5 text-muted-foreground" /><Input className="h-11 ps-10" aria-label={t("search")} placeholder={t("search")} value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></div>
      <div className="flex gap-3"><select className="h-11 rounded-lg border bg-card px-3" aria-label={t("allStatuses")} value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>{["all", "active", "inactive"].map(value => <option key={value} value={value}>{t(value === "all" ? "allStatuses" : value)}</option>)}</select><Button onClick={() => setEditing(null)}><Plus className="size-4" />{t("add")}</Button></div>
    </div>
    {selected.length ? <Button variant="destructive" disabled={busy} onClick={() => { setMutationError(""); setBulk(true); }}>{t("bulkDelete", { count: selected.length })}</Button> : null}
    {mutationError && !deleting ? <p role="alert" className="text-destructive">{mutationError}</p> : null}
    {error ? <div role="alert" className="space-y-3 rounded-xl border p-6"><p>{error}</p><Button onClick={onRetry} variant="outline">{t("retry")}</Button></div> : <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full min-w-[850px] text-sm"><thead><tr className="border-b"><th className="px-4"><input type="checkbox" aria-label={t("selectAll")} checked={rows.length > 0 && rows.every(row => selected.includes(row.id))} onChange={event => setSelected(event.target.checked ? Array.from(new Set([...selected, ...rows.map(row => row.id)])) : selected.filter(id => !rows.some(row => row.id === id)))} /></th>{["name", "number", "location", "address", "status", "action"].map(key => <th key={key} className="border-e px-5 py-4 text-start font-medium last:border-e-0">{t(key)}</th>)}</tr></thead><tbody>
      {loading || !rows.length ? <tr><td colSpan={7} className="h-40 text-center text-muted-foreground" role="status">{t(loading ? "loading" : "empty")}</td></tr> : rows.map(store => <tr key={store.id} className="border-b last:border-b-0"><td className="px-4"><input type="checkbox" aria-label={t("selectName", { name: store.name })} checked={selected.includes(store.id)} onChange={event => setSelected(event.target.checked ? [...selected, store.id] : selected.filter(id => id !== store.id))} /></td><td className="px-5 py-6">{store.name}</td><td className="px-5 py-6">{store.number}</td><td className="px-5 py-6">{store.location}</td><td className="px-5 py-6">{store.address}</td><td className="px-5 py-6"><StoreSwitch active={store.active} label={t("toggle", { name: store.name })} disabled={busy} onChange={() => void mutate(() => onToggle(store))} /></td><td className="px-5 py-6"><div className="flex gap-2"><Button variant="ghost" size="icon-sm" aria-label={t("deleteName", { name: store.name })} disabled={busy} onClick={() => { setMutationError(""); setDeleting(store); }}><Trash2 className="size-5" /></Button><Button variant="ghost" size="icon-sm" aria-label={t("editName", { name: store.name })} disabled={busy} onClick={() => void mutate(async () => setEditing(await onLoad(store.id)))}><Pencil className="size-5" /></Button></div></td></tr>)}
    </tbody></table></div>}
    <div className="flex items-center justify-between"><Button variant="outline" disabled={current === 1 || loading} onClick={() => setPage(current - 1)}>{t("previous")}</Button><span className="rounded-lg bg-primary/10 px-4 py-2 text-primary">{t("page", { current, total: last })}</span><Button variant="outline" disabled={current === last || loading} onClick={() => setPage(current + 1)}>{t("next")}</Button></div>
    {editing !== undefined ? <StoreForm key={editing?.id ?? "new"} store={editing ?? undefined} onClose={() => setEditing(undefined)} onSave={async input => { await onSave(input, editing?.id); setEditing(undefined); }} /> : null}
    <Dialog.Root open={Boolean(deleting) || bulk} onOpenChange={open => { if (!open && !busy) { setDeleting(null); setBulk(false); } }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/25" /><Dialog.Content className="fixed start-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-card p-6 rtl:translate-x-1/2"><Dialog.Title className="text-center text-xl font-bold">{t("deleteTitle")}</Dialog.Title><Dialog.Description className="mt-3 text-center text-muted-foreground">{t("deleteDescription", { name: bulk ? t("selectedCount", { count: selected.length }) : deleting?.name ?? "" })}</Dialog.Description>{mutationError ? <p role="alert" className="mt-3 text-destructive">{mutationError}</p> : null}<div className="mt-6 flex gap-4"><Button className="flex-1" variant="outline" disabled={busy} onClick={() => { setDeleting(null); setBulk(false); }}>{t("keep")}</Button><Button className="flex-1" variant="destructive" disabled={busy} onClick={() => { void mutate(async () => { if (bulk) { await onBulkDelete(selected); setSelected([]); setBulk(false); } else if (deleting) { await onDelete(deleting.id); setSelected(ids => ids.filter(id => id !== deleting.id)); setDeleting(null); } }); }}>{t("deleteConfirm")}</Button></div></Dialog.Content></Dialog.Portal></Dialog.Root>
  </div>;
}

function StoreForm({ store, onClose, onSave }: { store?: Store; onClose: () => void; onSave: (input: StoreInput) => Promise<void> }) {
  const t = useTranslations("dashboard.stores");
  const [form, setForm] = useState<StoreInput>({ name: store?.name ?? "", number: store?.number ?? "", latitude: store?.latitude != null ? String(store.latitude) : "", longitude: store?.longitude != null ? String(store.longitude) : "", address: store?.address ?? "", active: store?.active ?? true });
  const [mapOpen, setMapOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const input = { ...form, name: form.name.trim(), number: form.number.trim(), address: form.address.trim() };
    if (!input.name || !input.number || !input.latitude.trim() || !input.longitude.trim() || !input.address) { setError(t("required")); return; }
    if (!Number.isFinite(Number(input.latitude)) || Math.abs(Number(input.latitude)) > 90 || !Number.isFinite(Number(input.longitude)) || Math.abs(Number(input.longitude)) > 180) { setError(t("invalidCoordinates")); return; }
    setPending(true); setError("");
    try { await onSave(input); } catch (cause) { setError(normalizeApiError(cause).message); } finally { setPending(false); }
  }
  return <Dialog.Root open onOpenChange={open => { if (!open && !pending) onClose(); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/25" /><Dialog.Content aria-describedby={undefined} className="fixed start-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-card p-6 sm:p-8 rtl:translate-x-1/2"><Dialog.Title className="text-center text-2xl font-bold">{t(store ? "editTitle" : "addTitle")}</Dialog.Title><button type="button" aria-label={t("close")} disabled={pending} className="absolute end-4 top-4 rounded p-1" onClick={onClose}><X className="size-5" /></button>
    <form onSubmit={submit} className="mt-8 space-y-6"><fieldset disabled={pending} className="space-y-6"><div><p className="mb-2 font-medium">{t("activation")}</p><div className="flex items-center gap-2"><StoreSwitch active={form.active} label={t("activation")} onChange={() => setForm({ ...form, active: !form.active })} /><span>{t(form.active ? "active" : "inactive")}</span></div></div>
    {(["name", "number"] as const).map(key => <label key={key} className="block space-y-2"><span className="font-medium">{t(key)}</span><Input required className="h-12 bg-secondary" value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })} /></label>)}
    <div className="space-y-2"><p className="font-medium">{t("location")}</p><Button type="button" variant="outline" className="h-12 w-full justify-start border-primary text-primary" onClick={() => setMapOpen(true)}>{form.latitude && form.longitude ? <span className="flex w-full flex-wrap items-center justify-between gap-2"><span dir="ltr">{Number(form.latitude).toFixed(6)}, {Number(form.longitude).toFixed(6)}</span><span className="text-xs">{t("changeMapLocation")}</span></span> : t("chooseOnMap")}</Button>{form.latitude && form.longitude ? <p className="text-sm text-muted-foreground">{t("mapSelected")}</p> : null}</div>
    <label className="block space-y-2"><span className="font-medium">{t("address")}</span><Input required className="h-12 bg-secondary" value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} /></label></fieldset>
    {error ? <p role="alert" className="text-destructive">{error}</p> : null}<div className="flex gap-4"><Button type="button" className="h-12 flex-1" variant="outline" disabled={pending} onClick={onClose}>{t("cancel")}</Button><Button type="submit" className="h-12 flex-1" disabled={pending}>{t(pending ? "saving" : "confirm")}</Button></div></form>
    {mapOpen ? <StoreMapDialog initial={form.latitude && form.longitude ? { latitude: Number(form.latitude), longitude: Number(form.longitude) } : null} onClose={() => setMapOpen(false)} onConfirm={point => { setForm({ ...form, latitude: String(point.latitude), longitude: String(point.longitude) }); setMapOpen(false); }} /> : null}
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
