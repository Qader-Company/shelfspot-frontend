"use client";

import { ChevronLeft, ChevronRight, RotateCcw, Trash2, TriangleAlert, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { StatusToggle } from "@/shared/components/dashboard/status-toggle";
import { EmptyState, ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { Button } from "@/shared/ui/button";
import { usePermanentDeleteTrash, useRestoreTrash, useTrash } from "./hooks";
import { TRASH_TABS, type TrashItem, type TrashTab } from "./types";

type Confirm = { action: "delete" | "restore"; item: TrashItem };
const PAGE_SIZE = 8;

export function AdminTrashPage() {
  const t = useTranslations("adminTrash");
  const [tab, setTab] = useState<TrashTab>("brands");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<Confirm>();

  // Fetch all tabs in parallel so counts are always visible (Rules of Hooks: called unconditionally)
  const qBrands        = useTrash("brands");
  const qSubBrands     = useTrash("sub-brands");
  const qCategories    = useTrash("categories");
  const qSubCategories = useTrash("sub-categories");
  const qProducts      = useTrash("products");
  const qRequests      = useTrash("requests");
  const qFreelancers   = useTrash("freelancers");
  const qCompanies     = useTrash("companies");

  const tabQueries: Record<TrashTab, typeof qBrands> = {
    "brands": qBrands, "sub-brands": qSubBrands, "categories": qCategories,
    "sub-categories": qSubCategories, "products": qProducts,
    "requests": qRequests, "freelancers": qFreelancers, "companies": qCompanies,
  };

  const query = tabQueries[tab];
  const restore = useRestoreTrash();
  const remove = usePermanentDeleteTrash();
  const filtered = useMemo(() => (query.data ?? []).filter((item) => {
    const needle = search.trim().toLowerCase();
    return (!needle || Object.values(item).some((value) => String(value ?? "").toLowerCase().includes(needle))) &&
      (status === "all" || (status === "active") === item.active);
  }), [query.data, search, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const changeTab = (next: TrashTab) => { setTab(next); setPage(1); setSearch(""); setSelected(new Set()); };
  const toggle = (id: string) => setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const pending = restore.isPending || remove.isPending;
  async function submitConfirm() {
    if (!confirm) return;
    if (confirm.action === "restore") await restore.mutateAsync({ tab, id: confirm.item.id });
    else await remove.mutateAsync({ tab, id: confirm.item.id });
    setConfirm(undefined);
  }

  return <main className="space-y-6 px-4 py-8 lg:px-8">
    <header><h1 className="text-3xl font-bold">{t("title")}</h1><p className="mt-2 text-lg text-muted-foreground">{t("subtitle")}</p></header>
    <div className="flex gap-2 overflow-x-auto rounded-2xl bg-muted/50 p-3" role="tablist" aria-label={t("tabsLabel")}>
      {TRASH_TABS.map((key) => <button key={key} role="tab" aria-selected={tab === key} onClick={() => changeTab(key)} className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>{t(`tabs.${key}`)}<span className={`rounded-full px-1.5 py-0.5 text-xs ${tab === key ? "bg-primary-foreground/25" : "bg-muted"}`}>{tabQueries[key].data?.length ?? "—"}</span></button>)}
    </div>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><SearchInput label={t("searchLabel")} placeholder={t("searchPlaceholder", { entity: t(`tabs.${tab}`) })} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="max-w-md"/><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label={t("statusLabel")} className="h-11 rounded-lg border bg-card px-4"><option value="all">{t("statuses.all")}</option><option value="active">{t("statuses.active")}</option><option value="inactive">{t("statuses.inactive")}</option></select></div>
    {query.isPending ? <PageLoadingSkeleton showHeader={false} cardCount={0} tableRows={8} tableColumns={6} label={t("loading")}/> : query.isError ? <ErrorState title={t("error")} description={normalizeApiError(query.error).message} retryLabel={t("retry")} onRetry={() => void query.refetch()}/> : visible.length === 0 ? <EmptyState title={t("empty")} description={t("emptyDescription")}/> : <TrashTable tab={tab} items={visible} selected={selected} onToggle={toggle} onConfirm={setConfirm} t={t}/>} 
    <div className="flex items-center justify-between"><Button variant="outline" disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="rtl:rotate-180"/>{t("pagination.previous")}</Button><span className="text-sm text-muted-foreground">{t("pagination.page", { page, pages: pageCount })}</span><Button variant="outline" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>{t("pagination.next")}<ChevronRight className="rtl:rotate-180"/></Button></div>
    <ConfirmDialog value={confirm} pending={pending} error={restore.error ?? remove.error} onClose={() => setConfirm(undefined)} onConfirm={() => void submitConfirm()} t={t}/>
  </main>;
}

function TrashTable({ tab, items, selected, onToggle, onConfirm, t }: { tab: TrashTab; items: TrashItem[]; selected: Set<string>; onToggle: (id: string) => void; onConfirm: (value: Confirm) => void; t: ReturnType<typeof useTranslations<"adminTrash">> }) {
  const columns = tabColumns(tab);
  return <div className="overflow-x-auto rounded-xl border bg-card"><table className="w-full min-w-[900px] text-sm"><thead><tr><th className="w-12 border-b p-4"><span className="sr-only">{t("select")}</span></th>{columns.map((column) => <th key={column} className="border-b p-4 text-start font-medium">{t(`columns.${column}`)}</th>)}<th className="border-b p-4 text-start font-medium">{t("columns.action")}</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="p-4"><input type="checkbox" checked={selected.has(item.id)} onChange={() => onToggle(item.id)} aria-label={t("selectItem", { name: item.name })} className="size-5 accent-primary"/></td>{columns.map((column) => <td key={column} className="p-4">{cell(column, item, t)}</td>)}<td className="p-4"><div className="flex gap-1"><Button variant="ghost" size="icon-sm" aria-label={t("deleteItem", { name: item.name })} onClick={() => onConfirm({ action: "delete", item })}><Trash2/></Button>{tab !== "requests" && <Button variant="ghost" size="icon-sm" aria-label={t("restoreItem", { name: item.name })} onClick={() => onConfirm({ action: "restore", item })}><RotateCcw/></Button>}</div></td></tr>)}</tbody></table></div>;
}

function tabColumns(tab: TrashTab) { if (tab === "brands") return ["name", "status", "deletedAt"]; if (tab === "sub-brands") return ["name", "brand", "status", "deletedAt"]; if (tab === "categories") return ["name", "brand", "subBrand", "status", "deletedAt"]; if (tab === "sub-categories") return ["name", "brand", "subBrand", "category", "status", "deletedAt"]; if (tab === "products") return ["name", "family", "sku", "description", "status", "deletedAt"]; if (tab === "requests") return ["name", "company", "deletedAt", "store", "price", "requestStatus"]; if (tab === "freelancers") return ["name", "phone", "email", "completed", "status"]; return ["name", "industry", "crNumber", "email", "status"]; }
function cell(column: string, item: TrashItem, t: ReturnType<typeof useTranslations<"adminTrash">>) { if (column === "status") return <StatusToggle isActive={item.active} ariaLabel={item.active ? t("statuses.active") : t("statuses.inactive")}/>; if (column === "name") return <div><strong>{item.name}</strong>{item.secondary && <div className="text-muted-foreground">{item.secondary}</div>}</div>; if (column === "company") return item.secondary ? `${item.name} · ${item.secondary}` : item.name; if (column === "requestStatus") return <span className="rounded-full bg-muted px-2 py-1 capitalize">{item.status ?? "—"}</span>; const value: Record<string, unknown> = { brand: item.brand, subBrand: item.subBrand, category: item.category, family: item.family, sku: item.sku, description: item.description, deletedAt: item.deletedAt, phone: item.phone, email: item.email, completed: item.completedTasks, industry: item.industry, crNumber: item.crNumber, store: item.storeName, price: item.price ? `${item.price}$` : "—" }; return String(value[column] ?? "—"); }

function ConfirmDialog({ value, pending, error, onClose, onConfirm, t }: { value?: Confirm; pending: boolean; error: unknown; onClose: () => void; onConfirm: () => void; t: ReturnType<typeof useTranslations<"adminTrash">> }) { if (!value) return null; const restoring = value.action === "restore"; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="alertdialog" aria-modal="true" aria-labelledby="trash-dialog-title" className="w-full max-w-xl rounded-3xl bg-card p-5 shadow-xl"><Button variant="ghost" size="icon-sm" className="ms-auto flex" onClick={onClose} aria-label={t("dialog.close")}><X/></Button><div className="text-center"><div className={`mx-auto mb-4 flex size-14 items-center justify-center rounded-full ${restoring ? "bg-orange-50 text-orange-500" : "bg-destructive/10 text-destructive"}`}>{restoring ? <RotateCcw className="size-8"/> : <TriangleAlert className="size-8"/>}</div><h2 id="trash-dialog-title" className="text-xl font-semibold">{t(restoring ? "dialog.restoreTitle" : "dialog.deleteTitle")}</h2><p className="mt-2 text-muted-foreground">{t(restoring ? "dialog.restoreDescription" : "dialog.deleteDescription", { name: value.item.name })}</p>{Boolean(error) && <p role="alert" className="mt-3 text-sm text-destructive">{normalizeApiError(error).message}</p>}<div className="mt-5 flex gap-3"><Button variant="outline" className="flex-1" onClick={onClose}>{t("dialog.keep")}</Button><Button className={`flex-1 ${restoring ? "bg-orange-500 hover:bg-orange-600" : "bg-destructive hover:bg-destructive/90"}`} disabled={pending} onClick={onConfirm}>{t(restoring ? "dialog.restore" : "dialog.delete")}</Button></div></div></section></div>; }
