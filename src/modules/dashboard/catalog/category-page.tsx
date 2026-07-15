"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useDeferredValue, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useBrandsQuery } from "@/modules/dashboard/hooks/use-brands-query";
import { useCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation, useUpdateCategoryMutation } from "@/modules/dashboard/hooks/use-categories";
import { useSubBrandsQuery } from "@/modules/dashboard/hooks/use-sub-brands-query";
import { downloadCategoriesTemplateService, importCategoriesService } from "@/modules/dashboard/services/category-services";
import type { CompanyCategory } from "@/modules/dashboard/types/category";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { AddIcon, FilterIcon, PaginationNextIcon, PaginationPreviousIcon, UploadIcon } from "@/shared/components/dashboard/dashboard-icons";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { QUERY_KEYS } from "@/shared/lib/query/keys";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { CatalogFormDialog, CatalogStatusField } from "./catalog-form-dialog";
import { CatalogImportDialog } from "./catalog-import-dialog";
import { CatalogItemsTable, type CatalogExtraColumn } from "./catalog-items-table";
import { CatalogUploadArea } from "./catalog-upload-area";
import type { CategoryRow } from "./catalog.seed";

type Dialog = "add" | "edit" | "delete" | "import" | null;
function nameOf(item: CompanyCategory, locale: string) { if (item.name) return item.name; if (Array.isArray(item.translations)) return item.translations.find((x) => x.locale === locale)?.name ?? item.translations[0]?.name ?? "-"; const value = item.translations?.[locale]; return typeof value === "string" ? value : value?.name ?? "-"; }
function editName(item: CompanyCategory, locale: "en" | "ar") { if (Array.isArray(item.translations)) return item.translations.find((x) => x.locale === locale)?.name ?? item.name ?? ""; const value = item.translations?.[locale]; return typeof value === "string" ? value : value?.name ?? item.name ?? ""; }
function activeOf(item: CompanyCategory) { return item.active ?? (item.is_active === true || item.is_active === 1 || item.is_active === "1"); }
function relation(value: CompanyCategory["brand"] | CompanyCategory["sub_brand"], fallback?: string) { return typeof value === "string" ? value : value?.name ?? fallback ?? "-"; }
function matchesCategoryName(item: CompanyCategory, search: string) {
  if (!search) return true;
  const names = [item.name];
  if (Array.isArray(item.translations)) names.push(...item.translations.map((value) => value.name));
  else if (item.translations) {
    for (const value of Object.values(item.translations)) names.push(typeof value === "string" ? value : value?.name);
  }
  const term = search.toLocaleLowerCase();
  return names.some((value) => value?.toLocaleLowerCase().includes(term));
}

export function CategoryPage() {
  const t = useTranslations("dashboard"), locale = useLocale(), queryClient = useQueryClient();
  const [dialog, setDialog] = useState<Dialog>(null), [selectedId, setSelectedId] = useState<string | null>(null);
  const [brandId, setBrandId] = useState(""), [subBrandId, setSubBrandId] = useState(""), [nameEn, setNameEn] = useState(""), [nameAr, setNameAr] = useState("");
  const [active, setActive] = useState(true), [image, setImage] = useState<File | null>(null), [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "1" | "0">("all"), [brandFilter, setBrandFilter] = useState(""), [subBrandFilter, setSubBrandFilter] = useState(""), [page, setPage] = useState(1);
  const [error, setError] = useState(""), [deleteError, setDeleteError] = useState(""), [success, setSuccess] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null), [importError, setImportError] = useState(""), [importing, setImporting] = useState(false), [downloading, setDownloading] = useState(false), [downloadError, setDownloadError] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const brands = useBrandsQuery({ per_page: 100, page: 1 });
  const subBrands = useSubBrandsQuery({ per_page: 100, page: 1, brand_id: brandId || brandFilter || undefined });
  const categories = useCategoriesQuery({ per_page: deferredSearch ? 100 : 10, page, active: activeFilter === "all" ? undefined : activeFilter === "1", brand_id: brandFilter || undefined, sub_brand_id: subBrandFilter || undefined });
  const createMutation = useCreateCategoryMutation(), updateMutation = useUpdateCategoryMutation(), deleteMutation = useDeleteCategoryMutation();
  const rows = useMemo<CategoryRow[]>(() => (categories.data?.data ?? []).filter((item) => matchesCategoryName(item, deferredSearch)).map((item) => ({ id: String(item.id), name: nameOf(item, locale), thumbnailAlt: nameOf(item, locale), brand: relation(item.brand, item.brand_name), subBrand: relation(item.sub_brand, item.sub_brand_name), isActive: activeOf(item), statusDisplay: "toggle", createdDate: item.created_at ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at)) : "-" })), [categories.data?.data, deferredSearch, locale]);
  const current = categories.data?.meta?.current_page ?? page, last = Math.max(categories.data?.meta?.last_page ?? 1, 1);
  const pages = useMemo(() => Array.from({ length: Math.min(last, 5) }, (_, i) => Math.max(1, Math.min(current - 2, last - Math.min(last, 5) + 1)) + i), [current, last]);
  const close = () => { setDialog(null); setSelectedId(null); setError(""); setDeleteError(""); };
  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories() });
  const openAdd = () => { setBrandId(""); setSubBrandId(""); setNameEn(""); setNameAr(""); setActive(true); setImage(null); setError(""); setDialog("add"); };
  async function save() { if (!brandId || !subBrandId || !nameEn.trim() || !nameAr.trim() || (dialog === "add" && !image)) { setError(t("catalogPage.category.dialog.requiredFields")); return; } setError(""); try { const payload = { brandId, subBrandId, nameEn: nameEn.trim(), nameAr: nameAr.trim(), isActive: active, image: image ?? undefined }; const response = dialog === "edit" && selectedId ? await updateMutation.mutateAsync({ id: selectedId, payload }) : await createMutation.mutateAsync(payload); setSuccess(response.message); await refresh(); close(); } catch (value) { setError(normalizeApiError(value).message); } }
  function edit(id: string) { const item = categories.data?.data.find((x) => String(x.id) === id); if (!item) return; setSelectedId(id); setBrandId(String(item.brand_id)); setSubBrandId(String(item.sub_brand_id)); setNameEn(editName(item, "en")); setNameAr(editName(item, "ar")); setActive(activeOf(item)); setImage(null); setDialog("edit"); }
  async function remove() { if (!selectedId) return; try { const response = await deleteMutation.mutateAsync(selectedId); setSuccess(response.message); await refresh(); close(); } catch (value) { setDeleteError(normalizeApiError(value).message); } }
  async function download() { setDownloading(true); setDownloadError(""); try { await downloadCategoriesTemplateService(); } catch (value) { setDownloadError(normalizeApiError(value).message); } finally { setDownloading(false); } }
  async function upload() { if (!importFile) { setImportError(t("catalogPage.category.dialog.importFileRequired")); return; } setImporting(true); try { const response = await importCategoriesService(importFile); setSuccess(response.message); await refresh(); close(); } catch (value) { setImportError(normalizeApiError(value).message); } finally { setImporting(false); } }
  const labels = { nameColumn: t("catalogPage.category.table.columns.category"), status: t("catalogPage.table.columns.status"), createdDate: t("catalogPage.table.columns.createdDate"), action: t("catalogPage.table.columns.action"), selectAll: t("catalogPage.table.actions.selectAll"), selectRow: t("catalogPage.table.actions.selectRow"), delete: t("catalogPage.table.actions.delete"), edit: t("catalogPage.table.actions.edit"), toggleStatus: t("catalogPage.table.actions.toggleStatus"), activeLabel: t("catalogPage.status.active"), inactiveLabel: t("catalogPage.status.inactive") };
  const extra: CatalogExtraColumn[] = [{ key: "brand", header: t("catalogPage.category.table.columns.brand"), getValue: (r) => String(r.brand ?? "") }, { key: "subBrand", header: t("catalogPage.category.table.columns.subBrand"), getValue: (r) => String(r.subBrand ?? "") }];
  const brandOptions = brands.data?.data ?? [], subBrandOptions = subBrands.data?.data ?? [];

  return <div className="space-y-6 px-4 py-8 lg:px-8">
    <div className="flex justify-between gap-4"><div><h1 className="text-3xl font-bold">{t("catalogPage.category.title")}</h1><p className="mt-2 text-lg text-muted-foreground">{t("catalogPage.category.subtitle")}</p></div><div className="flex gap-3"><Button variant="outline" onClick={() => { setImportFile(null); setImportError(""); setDialog("import"); }}><UploadIcon className="size-4" />{t("catalogPage.actions.import")}</Button><Button onClick={openAdd}><AddIcon className="size-4" />{t("catalogPage.category.actions.add")}</Button></div></div>
    {success ? <p className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-success">{success}</p> : null}
    <div className="flex flex-wrap gap-3"><SearchInput label={t("catalogPage.search.label")} placeholder={t("catalogPage.search.placeholder")} className="max-w-[400px]" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /><select value={brandFilter} onChange={(e) => { setBrandFilter(e.target.value); setSubBrandFilter(""); setPage(1); }} className="h-11 rounded-lg border bg-card px-3"><option value="">{t("catalogPage.dialog.parentBrand")}</option>{brandOptions.map((x) => <option key={x.id} value={x.id}>{x.name ?? `#${x.id}`}</option>)}</select><select value={subBrandFilter} onChange={(e) => { setSubBrandFilter(e.target.value); setPage(1); }} className="h-11 rounded-lg border bg-card px-3"><option value="">{t("catalogPage.dialog.subBrand")}</option>{subBrandOptions.map((x) => <option key={x.id} value={x.id}>{x.name ?? `#${x.id}`}</option>)}</select><label className="relative"><FilterIcon className="absolute start-3 top-1/2 size-4 -translate-y-1/2" /><select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value as "all" | "1" | "0"); setPage(1); }} className="h-11 rounded-lg border bg-card pe-3 ps-9"><option value="all">{t("catalogPage.filters.allStatuses")}</option><option value="1">{t("catalogPage.status.active")}</option><option value="0">{t("catalogPage.status.inactive")}</option></select></label></div>
    {categories.isError ? <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive">{normalizeApiError(categories.error).message}</p> : <div className={cn(categories.isFetching && "opacity-60")}><CatalogItemsTable rows={rows} labels={labels} extraColumns={extra} onDelete={(id) => { setSelectedId(id); setDialog("delete"); }} onEdit={edit} /></div>}
    <div className="flex justify-between"><Button variant="outline" disabled={current <= 1} onClick={() => setPage((x) => x - 1)}><PaginationPreviousIcon className="size-4" />{t("catalogPage.pagination.previous")}</Button><div>{pages.map((x) => <Button key={x} variant="ghost" className={cn(x === current && "bg-primary/20")} onClick={() => setPage(x)}>{x}</Button>)}</div><Button variant="outline" disabled={current >= last} onClick={() => setPage((x) => x + 1)}>{t("catalogPage.pagination.next")}<PaginationNextIcon className="size-4" /></Button></div>
    <DeleteConfirmDialog isOpen={dialog === "delete"} title={t("catalogPage.category.deleteDialog.title")} descriptionLine1={t("catalogPage.category.deleteDialog.descriptionLine1")} descriptionLine2={t("catalogPage.category.deleteDialog.descriptionLine2")} cancelLabel={t("catalogPage.category.deleteDialog.cancel")} confirmLabel={t("catalogPage.category.deleteDialog.confirm")} onClose={close} onConfirm={remove} isPending={deleteMutation.isPending} errorMessage={deleteError} />
    <CatalogFormDialog isOpen={dialog === "add" || dialog === "edit"} title={dialog === "edit" ? t("catalogPage.category.dialog.editTitle") : t("catalogPage.category.dialog.title")} closeLabel={t("catalogPage.dialog.close")} cancelLabel={t("catalogPage.dialog.cancel")} saveLabel={t("catalogPage.dialog.save")} onClose={close} onSubmit={save} isPending={createMutation.isPending || updateMutation.isPending} errorMessage={error}>
      <select value={brandId} onChange={(e) => { setBrandId(e.target.value); setSubBrandId(""); }} required className="h-11 w-full rounded-lg border bg-secondary px-4"><option value="" disabled>{t("catalogPage.dialog.selectBrand")}</option>{brandOptions.map((x) => <option key={x.id} value={x.id}>{x.name ?? `#${x.id}`}</option>)}</select>
      <select value={subBrandId} onChange={(e) => setSubBrandId(e.target.value)} required className="h-11 w-full rounded-lg border bg-secondary px-4"><option value="" disabled>{t("catalogPage.dialog.selectSubBrand")}</option>{subBrandOptions.map((x) => <option key={x.id} value={x.id}>{x.name ?? `#${x.id}`}</option>)}</select>
      <CatalogUploadArea label={t("catalogPage.category.dialog.uploadLabel")} hint={t("catalogPage.dialog.uploadHint")} file={image} onFileChange={setImage} />
      <div><label>{t("catalogPage.category.dialog.nameEnLabel")}</label><Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} required /></div><div><label>{t("catalogPage.category.dialog.nameArLabel")}</label><Input dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} required /></div>
      <CatalogStatusField activeLabel={t("catalogPage.dialog.statusActive")} description={t("catalogPage.category.dialog.statusDescription")} ariaLabel={t("catalogPage.dialog.statusActive")} isActive={active} onChange={setActive} />
    </CatalogFormDialog>
    <CatalogImportDialog isOpen={dialog === "import"} title={t("catalogPage.import.title")} description={t("catalogPage.import.description")} downloadLabel={t("catalogPage.import.downloadLabel")} uploadLabel={t("catalogPage.import.uploadLabel")} uploadHint={t("catalogPage.import.uploadHint")} uploadFormat={t("catalogPage.import.uploadFormat")} cancelLabel={t("catalogPage.dialog.cancel")} saveLabel={t("catalogPage.dialog.save")} closeLabel={t("catalogPage.dialog.close")} onClose={close} onDownload={download} isDownloading={downloading} downloadError={downloadError} selectedFile={importFile} onFileChange={setImportFile} onImport={upload} isImporting={importing} importError={importError} />
  </div>;
}
