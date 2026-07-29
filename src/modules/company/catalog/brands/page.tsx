"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useDeferredValue, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useBrandsQuery } from "@/modules/company/catalog/brands/use-query";
import { useCreateBrandMutation } from "@/modules/company/catalog/brands/use-create-mutation";
import { useDeleteBrandMutation } from "@/modules/company/catalog/brands/use-delete-mutation";
import { useUpdateBrandMutation } from "@/modules/company/catalog/brands/use-update-mutation";
import { downloadBrandsTemplateService } from "@/modules/company/catalog/brands/download-template-service";
import { importBrandsService } from "@/modules/company/catalog/brands/import-service";
import type {
  CompanyBrand,
  GetBrandsResponse,
} from "@/modules/company/catalog/brands/types";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { QUERY_KEYS } from "@/shared/lib/query/keys";

import {
  AddIcon,
  FilterIcon,
  PaginationNextIcon,
  PaginationPreviousIcon,
  UploadIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { CatalogFormDialog, CatalogStatusField } from "@/shared/components/catalog/form-dialog";
import { CatalogImportDialog } from "@/shared/components/catalog/import-dialog";
import { CatalogItemsTable } from "@/modules/company/catalog/shared/items-table";
import { CatalogUploadArea } from "@/shared/components/catalog/upload-area";
import type { BrandRow } from "@/modules/company/catalog/shared/seed";

type BrandDialog = "add" | "edit" | "delete" | "import" | null;

function getBrandName(brand: CompanyBrand, locale: string) {
  if (brand.name) return brand.name;

  const translations = brand.translations;
  if (Array.isArray(translations)) {
    return (
      translations.find((translation) => translation.locale === locale)?.name ??
      translations[0]?.name ??
      "-"
    );
  }

  if (translations) {
    const localized = translations[locale];
    if (typeof localized === "string") return localized;
    if (localized?.name) return localized.name;

    for (const translation of Object.values(translations)) {
      if (typeof translation === "string") return translation;
      if (translation?.name) return translation.name;
    }
  }

  return "-";
}

function getBrandTranslationName(brand: CompanyBrand, locale: "en" | "ar") {
  const translations = brand.translations;

  if (Array.isArray(translations)) {
    return (
      translations.find((translation) => translation.locale === locale)?.name ??
      brand.name ??
      ""
    );
  }

  const localized = translations?.[locale];
  if (typeof localized === "string") return localized;
  return localized?.name ?? brand.name ?? "";
}

function normalizeActive(value: CompanyBrand["is_active"]) {
  return value === true || value === 1 || value === "1";
}

function isBrandActive(brand: CompanyBrand) {
  return brand.active ?? normalizeActive(brand.is_active);
}

function matchesBrandName(brand: CompanyBrand, search: string) {
  if (!search) return true;
  const names: (string | undefined)[] = [brand.name];
  if (Array.isArray(brand.translations)) names.push(...brand.translations.map((value) => value.name));
  else if (brand.translations) Object.values(brand.translations).forEach((value) => names.push(typeof value === "string" ? value : value?.name));
  const term = search.toLocaleLowerCase();
  return names.some((value) => value?.toLocaleLowerCase().includes(term));
}

export function BrandPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState<BrandDialog>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [searchName, setSearchName] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "1" | "0">("all");
  const [page, setPage] = useState(1);
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [logo, setLogo] = useState<File | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const createBrandMutation = useCreateBrandMutation();
  const deleteBrandMutation = useDeleteBrandMutation();
  const updateBrandMutation = useUpdateBrandMutation();
  const deferredName = useDeferredValue(searchName.trim());
  const brandsQuery = useBrandsQuery({
    per_page: deferredName ? 100 : 10,
    page,
    active: activeFilter === "all" ? undefined : activeFilter === "1",
  });

  const brandRows = useMemo<BrandRow[]>(
    () =>
      (brandsQuery.data?.data ?? [])
        .filter((brand) => {
          const matchesName = matchesBrandName(brand, searchName.trim());
          const matchesStatus =
            activeFilter === "all" ||
            isBrandActive(brand) === (activeFilter === "1");

          return matchesName && matchesStatus;
        })
        .map((brand) => {
          const name = getBrandName(brand, locale);

          return {
            id: String(brand.id),
            name,
        thumbnailAlt: name,
        thumbnailUrl: brand.logo_url ?? brand.logo ?? null,
            isActive: isBrandActive(brand),
            statusDisplay: "toggle",
            createdDate: brand.created_at
              ? new Intl.DateTimeFormat(locale, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(brand.created_at))
              : "-",
          };
        }),
    [activeFilter, brandsQuery.data?.data, locale, searchName],
  );
  const currentPage = brandsQuery.data?.meta?.current_page ?? page;
  const lastPage = Math.max(brandsQuery.data?.meta?.last_page ?? 1, 1);
  const paginationPages = useMemo(() => {
    const count = Math.min(lastPage, 5);
    const start = Math.max(1, Math.min(currentPage - 2, lastPage - count + 1));
    return Array.from({ length: count }, (_, index) => start + index);
  }, [currentPage, lastPage]);

  const close = () => {
    setOpenDialog(null);
    setSelectedBrandId(null);
    setFormError("");
    setDeleteError("");
  };

  const openAddDialog = () => {
    setNameEn("");
    setNameAr("");
    setIsActive(true);
    setLogo(null);
    setExistingLogoUrl(null);
    setFormError("");
    setOpenDialog("add");
  };

  const openImportDialog = () => {
    setImportFile(null);
    setImportError("");
    setDownloadError("");
    setOpenDialog("import");
  };

  async function handleCreateBrand() {
    if (!nameEn.trim() || !nameAr.trim()) {
      setFormError(t("catalogPage.brand.dialog.requiredNames"));
      return;
    }

    setFormError("");

    try {
      const response = await createBrandMutation.mutateAsync({
        nameEn: nameEn.trim(),
        nameAr: nameAr.trim(),
        isActive,
        logo: logo ?? undefined,
      });
      setSuccessMessage(
        response.message || t("catalogPage.brand.dialog.success"),
      );
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands() });
      close();
    } catch (error) {
      const apiError = normalizeApiError(error);
      setFormError(apiError.message || t("catalogPage.brand.dialog.error"));
    }
  }

  async function handleUpdateBrand() {
    if (!selectedBrandId) return;

    if (!nameEn.trim() || !nameAr.trim()) {
      setFormError(t("catalogPage.brand.dialog.requiredNames"));
      return;
    }

    setFormError("");

    const updatedPayload = {
      nameEn: nameEn.trim(),
      nameAr: nameAr.trim(),
      isActive,
      logo: logo ?? undefined,
      logoAction: logo ? "replace" as const : existingLogoUrl ? "keep" as const : "remove" as const,
    };

    try {
      const response = await updateBrandMutation.mutateAsync({
        id: selectedBrandId,
        payload: updatedPayload,
      });
      setSuccessMessage(
        response.message || t("catalogPage.brand.dialog.updateSuccess"),
      );
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands() });
      queryClient.setQueriesData<GetBrandsResponse>(
        { queryKey: QUERY_KEYS.brands() },
        (cached) =>
          cached
            ? {
                ...cached,
                data: cached.data.map((brand) =>
                  String(brand.id) === selectedBrandId
                    ? {
                        ...brand,
                        name:
                          locale === "ar"
                            ? updatedPayload.nameAr
                            : updatedPayload.nameEn,
                        active: updatedPayload.isActive,
                        translations: {
                          en: { name: updatedPayload.nameEn },
                          ar: { name: updatedPayload.nameAr },
                        },
                      }
                    : brand,
                ),
              }
            : cached,
      );
      close();
    } catch (error) {
      const apiError = normalizeApiError(error);
      setFormError(
        apiError.message || t("catalogPage.brand.dialog.updateError"),
      );
    }
  }

  async function handleDownloadTemplate() {
    setIsDownloadingTemplate(true);
    setDownloadError("");

    try {
      await downloadBrandsTemplateService();
    } catch (error) {
      const apiError = normalizeApiError(error);
      setDownloadError(
        apiError.message || t("catalogPage.brand.dialog.templateError"),
      );
    } finally {
      setIsDownloadingTemplate(false);
    }
  }

  async function handleImportBrands() {
    if (!importFile) {
      setImportError(t("catalogPage.brand.dialog.importFileRequired"));
      return;
    }

    setIsImporting(true);
    setImportError("");

    try {
      const response = await importBrandsService(importFile);
      setSuccessMessage(
        response.message || t("catalogPage.brand.dialog.importSuccess"),
      );
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands() });
      close();
    } catch (error) {
      const apiError = normalizeApiError(error);
      setImportError(
        apiError.message || t("catalogPage.brand.dialog.importError"),
      );
    } finally {
      setIsImporting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!selectedBrandId) return;

    setDeleteError("");

    try {
      const response = await deleteBrandMutation.mutateAsync(selectedBrandId);
      setSuccessMessage(
        response.message || t("catalogPage.brand.deleteDialog.success"),
      );
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands() });
      close();
    } catch (error) {
      const apiError = normalizeApiError(error);
      setDeleteError(
        apiError.message || t("catalogPage.brand.deleteDialog.error"),
      );
    }
  }

  const handleDelete = (id: string) => {
    setSelectedBrandId(id);
    setDeleteError("");
    setOpenDialog("delete");
  };
  const handleEdit = (id: string) => {
    const brand = brandsQuery.data?.data.find(
      (candidate) => String(candidate.id) === id,
    );
    if (!brand) return;

    setSelectedBrandId(id);
    setNameEn(getBrandTranslationName(brand, "en"));
    setNameAr(getBrandTranslationName(brand, "ar"));
    setIsActive(isBrandActive(brand));
    setLogo(null);
    setExistingLogoUrl(brand.logo_url ?? brand.logo ?? null);
    setFormError("");
    setOpenDialog("edit");
  };

  const tableLabels = {
    nameColumn:   t("catalogPage.brand.table.columns.brandName"),
    status:       t("catalogPage.table.columns.status"),
    createdDate:  t("catalogPage.table.columns.createdDate"),
    action:       t("catalogPage.table.columns.action"),
    selectAll:    t("catalogPage.table.actions.selectAll"),
    selectRow:    t("catalogPage.table.actions.selectRow"),
    delete:       t("catalogPage.table.actions.delete"),
    edit:         t("catalogPage.table.actions.edit"),
    toggleStatus: t("catalogPage.table.actions.toggleStatus"),
    activeLabel:  t("catalogPage.status.active"),
    inactiveLabel: t("catalogPage.status.inactive"),
    loading: t("catalogPage.table.loading"),
    empty: t("catalogPage.table.empty"),
  };

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-foreground">
            {t("catalogPage.brand.title")}
          </h1>
          <p className="mt-2 text-lg font-medium text-muted-foreground">
            {t("catalogPage.brand.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-medium shadow-none"
            onClick={openImportDialog}
          >
            <UploadIcon className="size-4" />
            {t("catalogPage.actions.import")}
          </Button>
          <Button
            type="button"
            className="h-10 gap-2 rounded-lg px-4 text-sm font-semibold text-white hover:text-white"
            onClick={openAddDialog}
          >
            <AddIcon className="size-4" />
            {t("catalogPage.brand.actions.add")}
          </Button>
        </div>
      </div>

      {successMessage ? (
        <p
          className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success"
          role="status"
        >
          {successMessage}
        </p>
      ) : null}

      {/* Search + filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchInput
          label={t("catalogPage.search.label")}
          placeholder={t("catalogPage.search.placeholder")}
          className="max-w-[400px]"
          value={searchName}
          onChange={(event) => {
            setSearchName(event.target.value);
            setPage(1);
          }}
        />
        <label className="relative">
          <span className="sr-only">
            {t("catalogPage.filters.allStatuses")}
          </span>
          <FilterIcon className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2" />
          <select
            value={activeFilter}
            onChange={(event) => {
              setActiveFilter(event.target.value as "all" | "1" | "0");
              setPage(1);
            }}
            className="h-10 appearance-none rounded-lg border border-border bg-card pe-8 ps-10 text-sm font-medium text-foreground"
          >
            <option value="all">{t("catalogPage.filters.allStatuses")}</option>
            <option value="1">{t("catalogPage.status.active")}</option>
            <option value="0">{t("catalogPage.status.inactive")}</option>
          </select>
        </label>
      </div>

      {/* Table */}
      {brandsQuery.isError ? (
        <p
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {normalizeApiError(brandsQuery.error).message ||
            t("catalogPage.brand.listError")}
        </p>
      ) : (
        <div className={cn(brandsQuery.isFetching && "opacity-60")}>
          <CatalogItemsTable
            rows={brandRows}
            labels={tableLabels}
            extraColumns={[]}
            isLoading={brandsQuery.isLoading}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-4 px-5 pb-2 md:flex-row">
        <Button
          type="button"
          variant="outline"
          disabled={currentPage <= 1 || brandsQuery.isFetching}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none"
        >
          <PaginationPreviousIcon className="size-4 rtl:rotate-180" />
          {t("catalogPage.pagination.previous")}
        </Button>
        <div className="flex items-center gap-2">
          {paginationPages.map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setPage(pageNumber)}
              className={cn(
                "rounded-lg text-sm text-muted-foreground",
                pageNumber === currentPage &&
                  "bg-primary/20 text-foreground hover:bg-primary/20",
              )}
            >
              {pageNumber}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={currentPage >= lastPage || brandsQuery.isFetching}
          onClick={() => setPage((value) => Math.min(lastPage, value + 1))}
          className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none"
        >
          {t("catalogPage.pagination.next")}
          <PaginationNextIcon className="size-4 rtl:rotate-180" />
        </Button>
      </div>

      {/* Delete Brand confirmation */}
      <DeleteConfirmDialog
        isOpen={openDialog === "delete"}
        title={t("catalogPage.brand.deleteDialog.title")}
        descriptionLine1={t("catalogPage.brand.deleteDialog.descriptionLine1")}
        descriptionLine2={t("catalogPage.brand.deleteDialog.descriptionLine2")}
        cancelLabel={t("catalogPage.brand.deleteDialog.cancel")}
        confirmLabel={t("catalogPage.brand.deleteDialog.confirm")}
        onClose={close}
        onConfirm={handleConfirmDelete}
        isPending={deleteBrandMutation.isPending}
        errorMessage={deleteError}
      />

      {/* Add Brand dialog */}
      <CatalogFormDialog
        isOpen={openDialog === "add" || openDialog === "edit"}
        title={openDialog === "edit" ? t("catalogPage.brand.dialog.editTitle") : t("catalogPage.brand.dialog.title")}
        closeLabel={t("catalogPage.dialog.close")}
        cancelLabel={t("catalogPage.dialog.cancel")}
        saveLabel={t("catalogPage.dialog.save")}
        onClose={close}
        onSubmit={
          openDialog === "add" ? handleCreateBrand : handleUpdateBrand
        }
        isPending={
          createBrandMutation.isPending || updateBrandMutation.isPending
        }
        errorMessage={formError}
      >
        <CatalogUploadArea
          label={t("catalogPage.brand.dialog.uploadLabel")}
          hint={t("catalogPage.dialog.uploadHint")}
          file={logo}
          onFileChange={setLogo}
          existingImageUrl={
            openDialog === "edit" ? existingLogoUrl : undefined
          }
          onRemove={openDialog === "edit" ? () => { setLogo(null); setExistingLogoUrl(null); } : undefined}
        />
        <div className="space-y-1.5">
          <label
            htmlFor="brand-name-en"
            className="text-sm font-semibold text-foreground"
          >
            {t("catalogPage.brand.dialog.nameEnLabel")}
          </label>
          <Input
            id="brand-name-en"
            type="text"
            value={nameEn}
            onChange={(event) => setNameEn(event.target.value)}
            placeholder={t("catalogPage.brand.dialog.nameEnPlaceholder")}
            required
            className="h-11 rounded-lg border-border bg-secondary text-sm shadow-none"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="brand-name-ar"
            className="text-sm font-semibold text-foreground"
          >
            {t("catalogPage.brand.dialog.nameArLabel")}
          </label>
          <Input
            id="brand-name-ar"
            type="text"
            dir="rtl"
            value={nameAr}
            onChange={(event) => setNameAr(event.target.value)}
            placeholder={t("catalogPage.brand.dialog.nameArPlaceholder")}
            required
            className="h-11 rounded-lg border-border bg-secondary text-sm shadow-none"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground">
            {t("catalogPage.dialog.statusLabel")}
          </p>
          <CatalogStatusField
            activeLabel={t("catalogPage.dialog.statusActive")}
            description={t("catalogPage.brand.dialog.statusDescription")}
            ariaLabel={t("catalogPage.dialog.statusActive")}
            isActive={isActive}
            onChange={setIsActive}
          />
        </div>
      </CatalogFormDialog>

      {/* Import dialog */}
      <CatalogImportDialog
        isOpen={openDialog === "import"}
        title={t("catalogPage.import.title")}
        description={t("catalogPage.import.description")}
        downloadLabel={t("catalogPage.import.downloadLabel")}
        uploadLabel={t("catalogPage.import.uploadLabel")}
        uploadHint={t("catalogPage.import.uploadHint")}
        uploadFormat={t("catalogPage.import.uploadFormat")}
        cancelLabel={t("catalogPage.dialog.cancel")}
        saveLabel={t("catalogPage.dialog.save")}
        closeLabel={t("catalogPage.dialog.close")}
        onClose={close}
        onDownload={handleDownloadTemplate}
        isDownloading={isDownloadingTemplate}
        downloadError={downloadError}
        selectedFile={importFile}
        onFileChange={(file) => {
          setImportFile(file);
          setImportError("");
        }}
        onImport={handleImportBrands}
        isImporting={isImporting}
        importError={importError}
      />
    </div>
  );
}
