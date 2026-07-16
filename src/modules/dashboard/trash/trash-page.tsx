"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForceDeleteTrashMutation, useRestoreTrashMutation, useTrashQuery } from "@/modules/dashboard/hooks/use-trash";
import type { TrashItem, TrashResource } from "@/modules/dashboard/services/trash-service";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { PaginationNextIcon, PaginationPreviousIcon, RestoreIcon, TrashIcon } from "@/shared/components/dashboard/dashboard-icons";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { Button } from "@/shared/ui/button";
import { TrashTabs } from "./trash-tabs";
import type { TrashTabKey } from "./trash.seed";

const resourceByTab: Record<TrashTabKey, TrashResource> = { brand: "brands", subBrand: "sub-brands", category: "categories", subCategory: "sub-categories", products: "products", requests: "tasks" };
const tabs: { key: TrashTabKey; label: string }[] = [
  { key: "brand", label: "trashPage.tabs.brand" }, { key: "subBrand", label: "trashPage.tabs.subBrand" },
  { key: "category", label: "trashPage.tabs.category" }, { key: "subCategory", label: "trashPage.tabs.subCategory" },
  { key: "products", label: "trashPage.tabs.products" }, { key: "requests", label: "trashPage.tabs.requests" },
];

function itemName(item: TrashItem, locale: string) {
  if (item.name) return item.name;
  if (Array.isArray(item.translations)) return item.translations.find((x) => x.locale === locale)?.name ?? item.translations[0]?.name ?? `#${item.id}`;
  const value = item.translations?.[locale];
  if (typeof value === "string") return value;
  return value?.name ?? item.title ?? (item.request_id ? `#${item.request_id}` : `#${item.id}`);
}

export function TrashPage() {
  const t = useTranslations("dashboard"), locale = useLocale(), queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TrashTabKey>("products"), [page, setPage] = useState(1), [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]), [pendingIds, setPendingIds] = useState<string[]>([]), [dialog, setDialog] = useState<"delete" | "restore" | null>(null), [error, setError] = useState(""), [success, setSuccess] = useState("");
  const resource = resourceByTab[activeTab], query = useTrashQuery(resource, page), restoreMutation = useRestoreTrashMutation(), deleteMutation = useForceDeleteTrashMutation();
  const rows = useMemo(() => (query.data?.data ?? []).filter((item) => itemName(item, locale).toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())), [locale, query.data?.data, search]);
  const allSelected = rows.length > 0 && rows.every((item) => selected.includes(String(item.id)));
  const current = query.data?.meta?.current_page ?? page, last = Math.max(query.data?.meta?.last_page ?? 1, 1);
  const open = (type: "delete" | "restore", ids: string[]) => { setPendingIds(ids); setError(""); setDialog(type); };
  const close = () => { setDialog(null); setPendingIds([]); setError(""); };
  async function confirm() { if (!dialog || !pendingIds.length) return; try { const response = dialog === "restore" ? await restoreMutation.mutateAsync({ resource, ids: pendingIds }) : await deleteMutation.mutateAsync({ resource, ids: pendingIds }); setSuccess(response.message); setSelected([]); await queryClient.invalidateQueries({ queryKey: ["app", "trash", resource] }); close(); } catch (value) { setError(normalizeApiError(value).message); } }
  const resolvedTabs = tabs.map((tab) => ({ key: tab.key, label: t(tab.label as Parameters<typeof t>[0]), count: tab.key === activeTab ? query.data?.meta?.total ?? query.data?.data.length ?? 0 : 0 }));

  return <div className="space-y-6 px-4 py-8 lg:px-8">
    <div><h1 className="text-3xl font-bold">{t("trashPage.title")}</h1><p className="mt-2 text-lg text-muted-foreground">{t("trashPage.subtitle")}</p></div>
    <TrashTabs tabs={resolvedTabs} activeTab={activeTab} onTabChange={(key) => { setActiveTab(key as TrashTabKey); setSelected([]); setPage(1); setSearch(""); }} />
    {success ? <p className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-success">{success}</p> : null}
    <div className="flex flex-wrap items-center justify-between gap-3"><SearchInput label={t("trashPage.search.label")} placeholder={t("trashPage.search.placeholder")} className="max-w-[420px]" value={search} onChange={(e) => setSearch(e.target.value)} /><div className="flex gap-2"><Button variant="outline" disabled={!selected.length} onClick={() => open("restore", selected)}><RestoreIcon className="size-4" />{t("trashPage.table.actions.restore")}</Button><Button variant="destructive" disabled={!selected.length} onClick={() => open("delete", selected)}><TrashIcon className="size-4" />{t("trashPage.table.actions.delete")}</Button></div></div>
    {query.isError ? <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive">{normalizeApiError(query.error).message}</p> : <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full min-w-[650px] text-start"><thead><tr className="border-b text-sm"><th className="p-4"><input type="checkbox" aria-label={t("trashPage.table.actions.selectAll")} checked={allSelected} onChange={() => setSelected(allSelected ? selected.filter((id) => !rows.some((item) => String(item.id) === id)) : Array.from(new Set([...selected, ...rows.map((item) => String(item.id))])))} /></th><th className="p-4 text-start">{activeTab === "requests" ? t("trashPage.requests.columns.requestId") : t("trashPage.table.columns.products")}</th><th className="p-4 text-start">{t("trashPage.table.columns.status")}</th><th className="p-4 text-start">{t("trashPage.table.columns.deletedDate")}</th><th className="p-4 text-start">{t("trashPage.table.columns.action")}</th></tr></thead><tbody>{rows.map((item) => { const id = String(item.id); const active = item.active ?? (item.is_active === true || item.is_active === 1 || item.is_active === "1"); return <tr key={id} className="border-b text-sm"><td className="p-4"><input type="checkbox" checked={selected.includes(id)} onChange={() => setSelected((value) => value.includes(id) ? value.filter((x) => x !== id) : [...value, id])} /></td><td className="p-4 font-medium">{itemName(item, locale)}</td><td className="p-4">{active ? t("catalogPage.status.active") : t("catalogPage.status.inactive")}</td><td className="p-4 text-muted-foreground">{item.deleted_at ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.deleted_at)) : "-"}</td><td className="p-4"><Button variant="ghost" size="icon-xs" onClick={() => open("delete", [id])}><TrashIcon className="size-4" /></Button><Button variant="ghost" size="icon-xs" onClick={() => open("restore", [id])}><RestoreIcon className="size-4" /></Button></td></tr>; })}</tbody></table></div>}
    <div className="flex justify-between"><Button variant="outline" disabled={current <= 1} onClick={() => setPage((x) => x - 1)}><PaginationPreviousIcon className="size-4" />{t("trashPage.pagination.previous")}</Button><span className="text-sm text-muted-foreground">{current} / {last}</span><Button variant="outline" disabled={current >= last} onClick={() => setPage((x) => x + 1)}>{t("trashPage.pagination.next")}<PaginationNextIcon className="size-4" /></Button></div>
    <DeleteConfirmDialog isOpen={dialog === "delete"} title={t("trashPage.dialogs.permanentDelete.title")} descriptionLine1={t("trashPage.dialogs.permanentDelete.descriptionLine1")} descriptionLine2={t("trashPage.dialogs.permanentDelete.descriptionLine2")} cancelLabel={t("trashPage.dialogs.permanentDelete.cancel")} confirmLabel={t("trashPage.dialogs.permanentDelete.confirm")} onClose={close} onConfirm={confirm} isPending={deleteMutation.isPending} errorMessage={error} />
    <DeleteConfirmDialog isOpen={dialog === "restore"} title={t("trashPage.dialogs.restore.title")} descriptionLine1={t("trashPage.dialogs.restore.descriptionLine1")} descriptionLine2={t("trashPage.dialogs.restore.descriptionLine2")} cancelLabel={t("trashPage.dialogs.restore.cancel")} confirmLabel={t("trashPage.dialogs.restore.confirm")} onClose={close} onConfirm={confirm} isPending={restoreMutation.isPending} errorMessage={error} />
  </div>;
}
