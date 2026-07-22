"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useDeferredValue, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useBrandsQuery } from "@/modules/company/catalog/brands/use-query";
import { useCreateSubBrandMutation } from "@/modules/company/catalog/sub-brands/use-create-mutation";
import { useDeleteSubBrandMutation } from "@/modules/company/catalog/sub-brands/use-delete-mutation";
import { useSubBrandsQuery } from "@/modules/company/catalog/sub-brands/use-query";
import { useUpdateSubBrandMutation } from "@/modules/company/catalog/sub-brands/use-update-mutation";
import { downloadSubBrandsTemplateService } from "@/modules/company/catalog/sub-brands/download-template-service";
import { importSubBrandsService } from "@/modules/company/catalog/sub-brands/import-service";
import type { CompanySubBrand } from "@/modules/company/catalog/sub-brands/types";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { AddIcon, FilterIcon, PaginationNextIcon, PaginationPreviousIcon, UploadIcon } from "@/shared/components/dashboard/dashboard-icons";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { QUERY_KEYS } from "@/shared/lib/query/keys";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { CatalogFormDialog, CatalogStatusField } from "@/shared/components/catalog/form-dialog";
import { CatalogImportDialog } from "@/shared/components/catalog/import-dialog";
import { CatalogItemsTable, type CatalogExtraColumn } from "@/modules/company/catalog/shared/items-table";
import { CatalogUploadArea } from "@/shared/components/catalog/upload-area";
import type { SubBrandRow } from "@/modules/company/catalog/shared/seed";

type SubBrandDialog = "add" | "edit" | "delete" | "import" | null;

function translationName(item: CompanySubBrand, locale: string) {
  if (item.name) return item.name;
  if (Array.isArray(item.translations)) return item.translations.find((value) => value.locale === locale)?.name ?? item.translations[0]?.name ?? "-";
  const value = item.translations?.[locale];
  if (typeof value === "string") return value;
  return value?.name ?? "-";
}

function editName(item: CompanySubBrand, locale: "en" | "ar") {
  if (Array.isArray(item.translations)) return item.translations.find((value) => value.locale === locale)?.name ?? item.name ?? "";
  const value = item.translations?.[locale];
  return typeof value === "string" ? value : value?.name ?? item.name ?? "";
}

function activeValue(item: CompanySubBrand) {
  return (
    item.active ??
    (item.is_active === true || item.is_active === 1 || item.is_active === "1")
  );
}

function parentName(item: CompanySubBrand) {
  if (typeof item.brand === "string") return item.brand;
  return item.brand?.name ?? item.brand_name ?? `#${item.brand_id}`;
}

function matchesSubBrandName(item: CompanySubBrand, search: string) {
  if (!search) return true;
  const names: (string | undefined)[] = [item.name];
  if (Array.isArray(item.translations)) names.push(...item.translations.map((value) => value.name));
  else if (item.translations) Object.values(item.translations).forEach((value) => names.push(typeof value === "string" ? value : value?.name));
  const term = search.toLocaleLowerCase();
  return names.some((value) => value?.toLocaleLowerCase().includes(term));
}

export function SubBrandPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState<SubBrandDialog>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [brandId, setBrandId] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [logo, setLogo] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "1" | "0">("all");
  const [brandFilter, setBrandFilter] = useState("");
  const [page, setPage] = useState(1);
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const deferredSearch = useDeferredValue(search.trim());

  const brandsQuery = useBrandsQuery({ per_page: 100, page: 1 });
  const subBrandsQuery = useSubBrandsQuery({ per_page: deferredSearch ? 100 : 10, page, active: activeFilter === "all" ? undefined : activeFilter === "1", brand_id: brandFilter || undefined });
  const createMutation = useCreateSubBrandMutation();
  const updateMutation = useUpdateSubBrandMutation();
  const deleteMutation = useDeleteSubBrandMutation();

  const rows = useMemo<SubBrandRow[]>(() => (subBrandsQuery.data?.data ?? []).filter((item) => matchesSubBrandName(item, search.trim())).map((item) => ({
    id: String(item.id), name: translationName(item, locale), thumbnailAlt: translationName(item, locale), thumbnailUrl: item.logo_url ?? item.logo ?? null,
    brand: parentName(item), isActive: activeValue(item), statusDisplay: "toggle",
    createdDate: item.created_at ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at)) : "-",
  })), [locale, search, subBrandsQuery.data?.data]);
  const currentPage = subBrandsQuery.data?.meta?.current_page ?? page;
  const lastPage = Math.max(subBrandsQuery.data?.meta?.last_page ?? 1, 1);
  const pages = useMemo(() => Array.from({ length: Math.min(lastPage, 5) }, (_, index) => Math.max(1, Math.min(currentPage - 2, lastPage - Math.min(lastPage, 5) + 1)) + index), [currentPage, lastPage]);

  const close = () => { setOpenDialog(null); setSelectedId(null); setFormError(""); setDeleteError(""); };
  const resetForm = () => { setBrandId(""); setNameEn(""); setNameAr(""); setIsActive(true); setLogo(null); setExistingImage(null); setFormError(""); };
  const openAdd = () => { resetForm(); setOpenDialog("add"); };
  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subBrands() });

  async function save() {
    if (!brandId || !nameEn.trim() || !nameAr.trim() || (openDialog === "add" && !logo)) { setFormError(t("catalogPage.subBrand.dialog.requiredFields")); return; }
    setFormError("");
    try {
      const payload = { brandId, nameEn: nameEn.trim(), nameAr: nameAr.trim(), isActive, logo: logo ?? undefined };
      const response = openDialog === "edit" && selectedId
        ? await updateMutation.mutateAsync({ id: selectedId, payload })
        : await createMutation.mutateAsync({ ...payload, logo: logo! });
      setSuccessMessage(response.message);
      await refresh(); close();
    } catch (error) { setFormError(normalizeApiError(error).message); }
  }

  function edit(id: string) {
    const item = subBrandsQuery.data?.data.find((value) => String(value.id) === id); if (!item) return;
    setSelectedId(id); setBrandId(String(item.brand_id ?? (typeof item.brand === "object" ? item.brand?.id : "")));
    setNameEn(editName(item, "en")); setNameAr(editName(item, "ar")); setIsActive(activeValue(item)); setLogo(null); setExistingImage(item.logo_url ?? item.logo ?? null); setFormError(""); setOpenDialog("edit");
  }

  async function remove() {
    if (!selectedId) return; setDeleteError("");
    try { const response = await deleteMutation.mutateAsync(selectedId); setSuccessMessage(response.message); await refresh(); close(); }
    catch (error) { setDeleteError(normalizeApiError(error).message); }
  }

  async function download() { setIsDownloading(true); setDownloadError(""); try { await downloadSubBrandsTemplateService(); } catch (error) { setDownloadError(normalizeApiError(error).message); } finally { setIsDownloading(false); } }
  async function importFileNow() { if (!importFile) { setImportError(t("catalogPage.subBrand.dialog.importFileRequired")); return; } setIsImporting(true); setImportError(""); try { const response = await importSubBrandsService(importFile); setSuccessMessage(response.message); await refresh(); close(); } catch (error) { setImportError(normalizeApiError(error).message); } finally { setIsImporting(false); } }

  const labels = { nameColumn: t("catalogPage.subBrand.table.columns.subBrandName"), status: t("catalogPage.table.columns.status"), createdDate: t("catalogPage.table.columns.createdDate"), action: t("catalogPage.table.columns.action"), selectAll: t("catalogPage.table.actions.selectAll"), selectRow: t("catalogPage.table.actions.selectRow"), delete: t("catalogPage.table.actions.delete"), edit: t("catalogPage.table.actions.edit"), toggleStatus: t("catalogPage.table.actions.toggleStatus"), activeLabel: t("catalogPage.status.active"), inactiveLabel: t("catalogPage.status.inactive"), loading: t("catalogPage.table.loading"), empty: t("catalogPage.table.empty") };
  const extraColumns: CatalogExtraColumn[] = [{ key: "brand", header: t("catalogPage.subBrand.table.columns.brand"), getValue: (row) => String(row.brand ?? "") }];

  return <div className="space-y-6 px-4 py-8 lg:px-8">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><h1 className="text-3xl font-bold">{t("catalogPage.subBrand.title")}</h1><p className="mt-2 text-lg text-muted-foreground">{t("catalogPage.subBrand.subtitle")}</p></div><div className="flex gap-3"><Button variant="outline" onClick={() => { setImportFile(null); setImportError(""); setOpenDialog("import"); }}><UploadIcon className="size-4" />{t("catalogPage.actions.import")}</Button><Button onClick={openAdd}><AddIcon className="size-4" />{t("catalogPage.subBrand.actions.add")}</Button></div></div>
    {successMessage ? <p className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">{successMessage}</p> : null}
    <div className="flex flex-wrap gap-3"><SearchInput label={t("catalogPage.search.label")} placeholder={t("catalogPage.search.placeholder")} className="max-w-[400px]" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /><select value={brandFilter} onChange={(event) => { setBrandFilter(event.target.value); setPage(1); }} className="h-11 rounded-lg border bg-card px-3"><option value="">{t("catalogPage.dialog.parentBrand")}</option>{(brandsQuery.data?.data ?? []).map((brand) => <option key={brand.id} value={brand.id}>{brand.name ?? `#${brand.id}`}</option>)}</select><label className="relative"><FilterIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" /><select value={activeFilter} onChange={(event) => { setActiveFilter(event.target.value as "all" | "1" | "0"); setPage(1); }} className="h-11 rounded-lg border bg-card pe-4 ps-9"><option value="all">{t("catalogPage.filters.allStatuses")}</option><option value="1">{t("catalogPage.status.active")}</option><option value="0">{t("catalogPage.status.inactive")}</option></select></label></div>
    {subBrandsQuery.isError ? <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{normalizeApiError(subBrandsQuery.error).message}</p> : <div className={cn(subBrandsQuery.isFetching && "opacity-60")}><CatalogItemsTable rows={rows} labels={labels} extraColumns={extraColumns} isLoading={subBrandsQuery.isLoading} onDelete={(id) => { setSelectedId(id); setOpenDialog("delete"); }} onEdit={edit} /></div>}
    <div className="flex items-center justify-between"><Button variant="outline" disabled={currentPage <= 1} onClick={() => setPage((value) => value - 1)}><PaginationPreviousIcon className="size-4" />{t("catalogPage.pagination.previous")}</Button><div>{pages.map((value) => <Button key={value} variant="ghost" onClick={() => setPage(value)} className={cn(value === currentPage && "bg-primary/20")}>{value}</Button>)}</div><Button variant="outline" disabled={currentPage >= lastPage} onClick={() => setPage((value) => value + 1)}>{t("catalogPage.pagination.next")}<PaginationNextIcon className="size-4" /></Button></div>
    <DeleteConfirmDialog isOpen={openDialog === "delete"} title={t("catalogPage.subBrand.deleteDialog.title")} descriptionLine1={t("catalogPage.subBrand.deleteDialog.descriptionLine1")} descriptionLine2={t("catalogPage.subBrand.deleteDialog.descriptionLine2")} cancelLabel={t("catalogPage.subBrand.deleteDialog.cancel")} confirmLabel={t("catalogPage.subBrand.deleteDialog.confirm")} onClose={close} onConfirm={remove} isPending={deleteMutation.isPending} errorMessage={deleteError} />
    <CatalogFormDialog isOpen={openDialog === "add" || openDialog === "edit"} title={openDialog === "edit" ? t("catalogPage.subBrand.dialog.editTitle") : t("catalogPage.subBrand.dialog.title")} closeLabel={t("catalogPage.dialog.close")} cancelLabel={t("catalogPage.dialog.cancel")} saveLabel={t("catalogPage.dialog.save")} onClose={close} onSubmit={save} isPending={createMutation.isPending || updateMutation.isPending} errorMessage={formError}>
      <div className="space-y-1.5"><label className="text-sm font-semibold">{t("catalogPage.dialog.parentBrand")}</label><select value={brandId} onChange={(event) => setBrandId(event.target.value)} required className="h-11 w-full rounded-lg border bg-secondary px-4"><option value="" disabled>{t("catalogPage.dialog.selectBrand")}</option>{(brandsQuery.data?.data ?? []).map((brand) => <option key={brand.id} value={brand.id}>{brand.name ?? `#${brand.id}`}</option>)}</select></div>
      <CatalogUploadArea label={t("catalogPage.subBrand.dialog.uploadLabel")} hint={t("catalogPage.dialog.uploadHint")} file={logo} onFileChange={setLogo} existingImageUrl={openDialog === "edit" ? existingImage : undefined} />
      <div className="space-y-1.5"><label className="text-sm font-semibold">{t("catalogPage.subBrand.dialog.nameEnLabel")}</label><Input value={nameEn} onChange={(event) => setNameEn(event.target.value)} required /></div>
      <div className="space-y-1.5"><label className="text-sm font-semibold">{t("catalogPage.subBrand.dialog.nameArLabel")}</label><Input dir="rtl" value={nameAr} onChange={(event) => setNameAr(event.target.value)} required /></div>
      <CatalogStatusField activeLabel={t("catalogPage.dialog.statusActive")} description={t("catalogPage.subBrand.dialog.statusDescription")} ariaLabel={t("catalogPage.dialog.statusActive")} isActive={isActive} onChange={setIsActive} />
    </CatalogFormDialog>
    <CatalogImportDialog isOpen={openDialog === "import"} title={t("catalogPage.import.title")} description={t("catalogPage.import.description")} downloadLabel={t("catalogPage.import.downloadLabel")} uploadLabel={t("catalogPage.import.uploadLabel")} uploadHint={t("catalogPage.import.uploadHint")} uploadFormat={t("catalogPage.import.uploadFormat")} cancelLabel={t("catalogPage.dialog.cancel")} saveLabel={t("catalogPage.dialog.save")} closeLabel={t("catalogPage.dialog.close")} onClose={close} onDownload={download} isDownloading={isDownloading} downloadError={downloadError} selectedFile={importFile} onFileChange={setImportFile} onImport={importFileNow} isImporting={isImporting} importError={importError} />
  </div>;
}
