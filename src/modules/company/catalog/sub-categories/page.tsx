"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useDeferredValue, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useBrandsQuery } from "@/modules/company/catalog/brands/use-query";
import { useCategoriesQuery } from "@/modules/company/catalog/categories/hooks";
import { useSubBrandsQuery } from "@/modules/company/catalog/sub-brands/use-query";
import { useCreateSubCategoryMutation, useDeleteSubCategoryMutation, useSubCategoriesQuery, useUpdateSubCategoryMutation } from "@/modules/company/catalog/sub-categories/hooks";
import { downloadSubCategoriesTemplateService, importSubCategoriesService } from "@/modules/company/catalog/sub-categories/service";
import type { CompanySubCategory } from "@/modules/company/catalog/sub-categories/types";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { AddIcon, FilterIcon, PaginationNextIcon, PaginationPreviousIcon, UploadIcon } from "@/shared/components/dashboard/dashboard-icons";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { QUERY_KEYS } from "@/shared/lib/query/keys";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { CatalogFormDialog, CatalogStatusField } from "@/modules/company/catalog/shared/form-dialog";
import { CatalogImportDialog } from "@/modules/company/catalog/shared/import-dialog";
import { CatalogItemsTable, type CatalogExtraColumn } from "@/modules/company/catalog/shared/items-table";
import { CatalogUploadArea } from "@/modules/company/catalog/shared/upload-area";
import type { SubCategoryRow } from "@/modules/company/catalog/shared/seed";

type Dialog = "add" | "edit" | "delete" | "import" | null;
function itemName(item: CompanySubCategory, locale: string) { if (item.name) return item.name; if (Array.isArray(item.translations)) return item.translations.find((x) => x.locale === locale)?.name ?? item.translations[0]?.name ?? "-"; const x = item.translations?.[locale]; return typeof x === "string" ? x : x?.name ?? "-"; }
function translated(item: CompanySubCategory, locale: "en" | "ar") { if (Array.isArray(item.translations)) return item.translations.find((x) => x.locale === locale)?.name ?? item.name ?? ""; const x = item.translations?.[locale]; return typeof x === "string" ? x : x?.name ?? item.name ?? ""; }
function isActive(item: CompanySubCategory) { return item.active ?? (item.is_active === true || item.is_active === 1 || item.is_active === "1"); }
function relation(value: CompanySubCategory["brand"] | CompanySubCategory["sub_brand"] | CompanySubCategory["category"], fallback?: string) { return typeof value === "string" ? value : value?.name ?? fallback ?? "-"; }
function relationId(
  directId: string | number | undefined,
  relationValue: CompanySubCategory["brand"] | CompanySubCategory["sub_brand"] | CompanySubCategory["category"],
) {
  if (directId != null) return String(directId);
  return typeof relationValue === "object" && relationValue?.id != null
    ? String(relationValue.id)
    : "";
}
function matches(item: CompanySubCategory, term: string) { if (!term) return true; const names: (string | undefined)[] = [item.name]; if (Array.isArray(item.translations)) names.push(...item.translations.map((x) => x.name)); else if (item.translations) Object.values(item.translations).forEach((x) => names.push(typeof x === "string" ? x : x?.name)); const search = term.toLocaleLowerCase(); return names.some((x) => x?.toLocaleLowerCase().includes(search)); }

export function SubCategoryPage() {
  const t = useTranslations("dashboard"), locale = useLocale(), queryClient = useQueryClient();
  const [dialog, setDialog] = useState<Dialog>(null), [selectedId, setSelectedId] = useState<string | null>(null);
  const [brandId, setBrandId] = useState(""), [subBrandId, setSubBrandId] = useState(""), [categoryId, setCategoryId] = useState("");
  const [nameEn, setNameEn] = useState(""), [nameAr, setNameAr] = useState(""), [active, setActive] = useState(true), [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [search, setSearch] = useState(""), [activeFilter, setActiveFilter] = useState<"all" | "1" | "0">("all"), [brandFilter, setBrandFilter] = useState(""), [subBrandFilter, setSubBrandFilter] = useState(""), [categoryFilter, setCategoryFilter] = useState(""), [page, setPage] = useState(1);
  const [error, setError] = useState(""), [deleteError, setDeleteError] = useState(""), [success, setSuccess] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null), [importError, setImportError] = useState(""), [importing, setImporting] = useState(false), [downloading, setDownloading] = useState(false), [downloadError, setDownloadError] = useState("");
  const deferred = useDeferredValue(search.trim());
  const brands = useBrandsQuery({ per_page: 100, page: 1 });
  const subBrands = useSubBrandsQuery({ per_page: 100, page: 1, brand_id: brandId || brandFilter || undefined });
  const categories = useCategoriesQuery({ per_page: 100, page: 1, brand_id: brandId || brandFilter || undefined, sub_brand_id: subBrandId || subBrandFilter || undefined });
  const list = useSubCategoriesQuery({ per_page: deferred ? 100 : 10, page, active: activeFilter === "all" ? undefined : activeFilter === "1", brand_id: brandFilter || undefined, sub_brand_id: subBrandFilter || undefined, category_id: categoryFilter || undefined });
  const createMutation = useCreateSubCategoryMutation(), updateMutation = useUpdateSubCategoryMutation(), deleteMutation = useDeleteSubCategoryMutation();
  const rows = useMemo<SubCategoryRow[]>(() => (list.data?.data ?? []).filter((x) => matches(x, search.trim())).map((x) => ({ id: String(x.id), name: itemName(x, locale), thumbnailAlt: itemName(x, locale), thumbnailUrl: x.image_url ?? x.image ?? x.logo_url ?? x.logo ?? null, brand: relation(x.brand, x.brand_name), subBrand: relation(x.sub_brand, x.sub_brand_name), category: relation(x.category, x.category_name), isActive: isActive(x), statusDisplay: "toggle", createdDate: x.created_at ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(x.created_at)) : "-" })), [list.data?.data, locale, search]);
  const current = list.data?.meta?.current_page ?? page, last = Math.max(list.data?.meta?.last_page ?? 1, 1), pageNumbers = useMemo(() => Array.from({ length: Math.min(last, 5) }, (_, i) => Math.max(1, Math.min(current - 2, last - Math.min(last, 5) + 1)) + i), [current, last]);
  const selectedItem = selectedId
    ? list.data?.data.find((value) => String(value.id) === selectedId)
    : undefined;
  const brandOptions = [...(brands.data?.data ?? [])];
  const selectedParentBrand = dialog === "add" || dialog === "edit" ? brandId : brandFilter;
  const selectedParentSubBrand = dialog === "add" || dialog === "edit" ? subBrandId : subBrandFilter;
  const subBrandOptions = [...(subBrands.data?.data ?? [])].filter((item) => !selectedParentBrand || String(item.brand_id ?? (typeof item.brand === "object" ? item.brand?.id : "")) === selectedParentBrand);
  const categoryOptions = [...(categories.data?.data ?? [])].filter((item) => !selectedParentSubBrand || String(item.sub_brand_id ?? (typeof item.sub_brand === "object" ? item.sub_brand?.id : "")) === selectedParentSubBrand);
  if (selectedItem && typeof selectedItem.brand === "object" && selectedItem.brand && !brandOptions.some((item) => String(item.id) === String(selectedItem.brand && typeof selectedItem.brand === "object" ? selectedItem.brand.id : ""))) {
    brandOptions.push({ ...selectedItem.brand, active: true });
  }
  if (selectedItem && typeof selectedItem.sub_brand === "object" && selectedItem.sub_brand && !subBrandOptions.some((item) => String(item.id) === String(selectedItem.sub_brand && typeof selectedItem.sub_brand === "object" ? selectedItem.sub_brand.id : ""))) {
    subBrandOptions.push({ ...selectedItem.sub_brand, active: true, brand_id: relationId(selectedItem.brand_id, selectedItem.brand) });
  }
  if (selectedItem && typeof selectedItem.category === "object" && selectedItem.category && !categoryOptions.some((item) => String(item.id) === String(selectedItem.category && typeof selectedItem.category === "object" ? selectedItem.category.id : ""))) {
    categoryOptions.push({ ...selectedItem.category, active: true, brand_id: relationId(selectedItem.brand_id, selectedItem.brand), sub_brand_id: relationId(selectedItem.sub_brand_id, selectedItem.sub_brand) });
  }
  const close = () => { setDialog(null); setSelectedId(null); setError(""); setDeleteError(""); };
  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subCategories() });
  const add = () => { setBrandId(""); setSubBrandId(""); setCategoryId(""); setNameEn(""); setNameAr(""); setActive(true); setImage(null); setExistingImage(null); setDialog("add"); };
  async function save() { if (!brandId || !subBrandId || !categoryId || !nameEn.trim() || !nameAr.trim() || (dialog === "add" && !image)) { setError(t("catalogPage.subCategory.dialog.requiredFields")); return; } try { const isCreating = dialog === "add"; const payload = { brandId, subBrandId, categoryId, nameEn: nameEn.trim(), nameAr: nameAr.trim(), isActive: active, image: image ?? undefined }; const response = dialog === "edit" && selectedId ? await updateMutation.mutateAsync({ id: selectedId, payload }) : await createMutation.mutateAsync(payload); setSuccess(response.message); if (isCreating) { setSearch(""); setPage(1); } await refresh(); close(); } catch (value) { setError(normalizeApiError(value).message); } }
  function edit(id: string) { const x = list.data?.data.find((value) => String(value.id) === id); if (!x) return; setSelectedId(id); setBrandId(relationId(x.brand_id, x.brand)); setSubBrandId(relationId(x.sub_brand_id, x.sub_brand)); setCategoryId(relationId(x.category_id, x.category)); setNameEn(translated(x, "en")); setNameAr(translated(x, "ar")); setActive(isActive(x)); setImage(null); setExistingImage(x.image_url ?? x.image ?? x.logo_url ?? x.logo ?? null); setDialog("edit"); }
  async function remove() { if (!selectedId) return; try { const response = await deleteMutation.mutateAsync(selectedId); setSuccess(response.message); await refresh(); close(); } catch (value) { setDeleteError(normalizeApiError(value).message); } }
  async function download() { setDownloading(true); try { await downloadSubCategoriesTemplateService(); } catch (value) { setDownloadError(normalizeApiError(value).message); } finally { setDownloading(false); } }
  async function upload() { if (!importFile) { setImportError(t("catalogPage.subCategory.dialog.importFileRequired")); return; } setImporting(true); try { const response = await importSubCategoriesService(importFile); setSuccess(response.message); await refresh(); close(); } catch (value) { setImportError(normalizeApiError(value).message); } finally { setImporting(false); } }
  const labels = { nameColumn: t("catalogPage.subCategory.table.columns.subCategory"), status: t("catalogPage.table.columns.status"), createdDate: t("catalogPage.table.columns.createdDate"), action: t("catalogPage.table.columns.action"), selectAll: t("catalogPage.table.actions.selectAll"), selectRow: t("catalogPage.table.actions.selectRow"), delete: t("catalogPage.table.actions.delete"), edit: t("catalogPage.table.actions.edit"), toggleStatus: t("catalogPage.table.actions.toggleStatus"), activeLabel: t("catalogPage.status.active"), inactiveLabel: t("catalogPage.status.inactive"), loading: t("catalogPage.table.loading"), empty: t("catalogPage.table.empty") };
  const extra: CatalogExtraColumn[] = [{ key: "brand", header: t("catalogPage.subCategory.table.columns.brand"), getValue: (x) => String(x.brand ?? "") }, { key: "subBrand", header: t("catalogPage.subCategory.table.columns.subBrand"), getValue: (x) => String(x.subBrand ?? "") }, { key: "category", header: t("catalogPage.subCategory.table.columns.category"), getValue: (x) => String(x.category ?? "") }];
  const select = (value: string, set: (x: string) => void, placeholder: string, options: { id: string | number; name?: string }[], disabled = false) => { const blocked = disabled || (options === subBrandOptions && !selectedParentBrand) || (options === categoryOptions && !selectedParentSubBrand); return <select value={value} onChange={(e) => set(e.target.value)} required disabled={blocked} className="h-11 rounded-lg border bg-card px-3 disabled:cursor-not-allowed disabled:opacity-50"><option value="">{placeholder}</option>{options.map((x) => <option key={x.id} value={x.id}>{x.name ?? `#${x.id}`}</option>)}</select>; };

  return <div className="space-y-6 px-4 py-8 lg:px-8">
    <div className="flex justify-between"><div><h1 className="text-3xl font-bold">{t("catalogPage.subCategory.title")}</h1><p className="mt-2 text-lg text-muted-foreground">{t("catalogPage.subCategory.subtitle")}</p></div><div className="flex gap-3"><Button variant="outline" onClick={() => { setImportFile(null); setImportError(""); setDialog("import"); }}><UploadIcon className="size-4" />{t("catalogPage.actions.import")}</Button><Button onClick={add}><AddIcon className="size-4" />{t("catalogPage.subCategory.actions.add")}</Button></div></div>
    {success ? <p className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-success">{success}</p> : null}
    <div className="flex flex-wrap gap-3"><SearchInput label={t("catalogPage.search.label")} placeholder={t("catalogPage.search.placeholder")} className="max-w-[400px]" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />{select(brandFilter, (x) => { setBrandFilter(x); setSubBrandFilter(""); setCategoryFilter(""); setPage(1); }, t("catalogPage.dialog.parentBrand"), brandOptions)}{select(subBrandFilter, (x) => { setSubBrandFilter(x); setCategoryFilter(""); setPage(1); }, t("catalogPage.dialog.subBrand"), subBrandOptions)}{select(categoryFilter, (x) => { setCategoryFilter(x); setPage(1); }, t("catalogPage.subCategory.dialog.categoryLabel"), categoryOptions)}<label className="relative"><FilterIcon className="absolute start-3 top-1/2 size-4 -translate-y-1/2" /><select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value as "all" | "1" | "0"); setPage(1); }} className="h-11 rounded-lg border bg-card ps-9"><option value="all">{t("catalogPage.filters.allStatuses")}</option><option value="1">{t("catalogPage.status.active")}</option><option value="0">{t("catalogPage.status.inactive")}</option></select></label></div>
    {list.isError ? <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive">{normalizeApiError(list.error).message}</p> : <div className={cn(list.isFetching && "opacity-60")}><CatalogItemsTable rows={rows} labels={labels} extraColumns={extra} isLoading={list.isLoading} onDelete={(id) => { setSelectedId(id); setDialog("delete"); }} onEdit={edit} /></div>}
    <div className="flex justify-between"><Button variant="outline" disabled={current <= 1} onClick={() => setPage((x) => x - 1)}><PaginationPreviousIcon className="size-4" />{t("catalogPage.pagination.previous")}</Button><div>{pageNumbers.map((x) => <Button key={x} variant="ghost" className={cn(x === current && "bg-primary/20")} onClick={() => setPage(x)}>{x}</Button>)}</div><Button variant="outline" disabled={current >= last} onClick={() => setPage((x) => x + 1)}>{t("catalogPage.pagination.next")}<PaginationNextIcon className="size-4" /></Button></div>
    <DeleteConfirmDialog isOpen={dialog === "delete"} title={t("catalogPage.subCategory.deleteDialog.title")} descriptionLine1={t("catalogPage.subCategory.deleteDialog.descriptionLine1")} descriptionLine2={t("catalogPage.subCategory.deleteDialog.descriptionLine2")} cancelLabel={t("catalogPage.subCategory.deleteDialog.cancel")} confirmLabel={t("catalogPage.subCategory.deleteDialog.confirm")} onClose={close} onConfirm={remove} isPending={deleteMutation.isPending} errorMessage={deleteError} />
    <CatalogFormDialog isOpen={dialog === "add" || dialog === "edit"} title={dialog === "edit" ? t("catalogPage.subCategory.dialog.editTitle") : t("catalogPage.subCategory.dialog.title")} closeLabel={t("catalogPage.dialog.close")} cancelLabel={t("catalogPage.dialog.cancel")} saveLabel={t("catalogPage.dialog.save")} onClose={close} onSubmit={save} isPending={createMutation.isPending || updateMutation.isPending} errorMessage={error}>
      {select(brandId, (x) => { setBrandId(x); setSubBrandId(""); setCategoryId(""); }, t("catalogPage.dialog.selectBrand"), brandOptions)}{select(subBrandId, (x) => { setSubBrandId(x); setCategoryId(""); }, t("catalogPage.dialog.selectSubBrand"), subBrandOptions)}{select(categoryId, setCategoryId, t("catalogPage.subCategory.dialog.selectCategory"), categoryOptions)}
      <CatalogUploadArea label={t("catalogPage.subCategory.dialog.uploadLabel")} hint={t("catalogPage.dialog.uploadHint")} file={image} onFileChange={setImage} existingImageUrl={dialog === "edit" ? existingImage : undefined} /><div><label>{t("catalogPage.subCategory.dialog.nameEnLabel")}</label><Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} required /></div><div><label>{t("catalogPage.subCategory.dialog.nameArLabel")}</label><Input dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} required /></div><CatalogStatusField activeLabel={t("catalogPage.dialog.statusActive")} description={t("catalogPage.subCategory.dialog.statusDescription")} ariaLabel={t("catalogPage.dialog.statusActive")} isActive={active} onChange={setActive} />
    </CatalogFormDialog>
    <CatalogImportDialog isOpen={dialog === "import"} title={t("catalogPage.import.title")} description={t("catalogPage.import.description")} downloadLabel={t("catalogPage.import.downloadLabel")} uploadLabel={t("catalogPage.import.uploadLabel")} uploadHint={t("catalogPage.import.uploadHint")} uploadFormat={t("catalogPage.import.uploadFormat")} cancelLabel={t("catalogPage.dialog.cancel")} saveLabel={t("catalogPage.dialog.save")} closeLabel={t("catalogPage.dialog.close")} onClose={close} onDownload={download} isDownloading={downloading} downloadError={downloadError} selectedFile={importFile} onFileChange={setImportFile} onImport={upload} isImporting={importing} importError={importError} />
  </div>;
}
