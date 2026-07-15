"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useBrandsQuery } from "@/modules/dashboard/hooks/use-brands-query";
import { useCreateSubBrandMutation } from "@/modules/dashboard/hooks/use-create-sub-brand-mutation";
import { normalizeApiError } from "@/shared/lib/api/errors";

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

import {
  CatalogFormDialog,
  CatalogStatusField,
} from "./catalog-form-dialog";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { CatalogImportDialog } from "./catalog-import-dialog";
import { CatalogItemsTable } from "./catalog-items-table";
import type { CatalogExtraColumn } from "./catalog-items-table";
import { CatalogUploadArea } from "./catalog-upload-area";
import {
  catalogPagination,
  subBrandRows,
} from "./catalog.seed";

type SubBrandDialog = "add" | "edit" | "delete" | "import" | null;

export function SubBrandPage() {
  const t = useTranslations("dashboard");
  const [openDialog, setOpenDialog] = useState<SubBrandDialog>(null);
  const [brandId, setBrandId] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [logo, setLogo] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const brandsQuery = useBrandsQuery({ per_page: 100, page: 1 });
  const createSubBrandMutation = useCreateSubBrandMutation();

  const close = () => {
    setOpenDialog(null);
    setFormError("");
  };

  const openAddDialog = () => {
    setBrandId("");
    setNameEn("");
    setNameAr("");
    setIsActive(true);
    setLogo(null);
    setFormError("");
    setOpenDialog("add");
  };

  async function handleCreateSubBrand() {
    if (!brandId || !nameEn.trim() || !nameAr.trim() || !logo) {
      setFormError(t("catalogPage.subBrand.dialog.requiredFields"));
      return;
    }

    setFormError("");

    try {
      const response = await createSubBrandMutation.mutateAsync({
        brandId,
        nameEn: nameEn.trim(),
        nameAr: nameAr.trim(),
        isActive,
        logo,
      });
      setSuccessMessage(
        response.message || t("catalogPage.subBrand.dialog.success"),
      );
      close();
    } catch (error) {
      const apiError = normalizeApiError(error);
      setFormError(apiError.message || t("catalogPage.subBrand.dialog.error"));
    }
  }
  const handleDelete = () => setOpenDialog("delete");
  const handleEdit = () => setOpenDialog("edit");

  const extraColumns: CatalogExtraColumn[] = [
    {
      key: "brand",
      header: t("catalogPage.subBrand.table.columns.brand"),
      getValue: (row) => String(row.brand ?? ""),
    },
  ];

  const tableLabels = {
    nameColumn:    t("catalogPage.subBrand.table.columns.subBrandName"),
    status:        t("catalogPage.table.columns.status"),
    createdDate:   t("catalogPage.table.columns.createdDate"),
    action:        t("catalogPage.table.columns.action"),
    selectAll:     t("catalogPage.table.actions.selectAll"),
    selectRow:     t("catalogPage.table.actions.selectRow"),
    delete:        t("catalogPage.table.actions.delete"),
    edit:          t("catalogPage.table.actions.edit"),
    toggleStatus:  t("catalogPage.table.actions.toggleStatus"),
    activeLabel:   t("catalogPage.status.active"),
    inactiveLabel: t("catalogPage.status.inactive"),
  };

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-foreground">
            {t("catalogPage.subBrand.title")}
          </h1>
          <p className="mt-2 text-lg font-medium text-muted-foreground">
            {t("catalogPage.subBrand.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-medium shadow-none" onClick={() => setOpenDialog("import")}>
            <UploadIcon className="size-4" />
            {t("catalogPage.actions.import")}
          </Button>
          <Button type="button" className="h-10 gap-2 rounded-lg px-4 text-sm font-semibold text-white hover:text-white" onClick={openAddDialog}>
            <AddIcon className="size-4" />
            {t("catalogPage.subBrand.actions.add")}
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

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchInput label={t("catalogPage.search.label")} placeholder={t("catalogPage.search.placeholder")} className="max-w-[400px]" />
        <Button type="button" variant="outline" className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-medium text-foreground shadow-none">
          <FilterIcon className="size-4" />
          {t("catalogPage.filters.allStatuses")}
        </Button>
      </div>

      <CatalogItemsTable rows={subBrandRows} labels={tableLabels} extraColumns={extraColumns} onDelete={handleDelete} onEdit={handleEdit} />

      <div className="flex flex-col items-center justify-between gap-4 px-5 pb-2 md:flex-row">
        <Button type="button" variant="outline" className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none">
          <PaginationPreviousIcon className="size-4 rtl:rotate-180" />
          {t("catalogPage.pagination.previous")}
        </Button>
        <div className="flex items-center gap-2">
          {catalogPagination.pages.map((page) => (
            <Button key={page} type="button" variant="ghost" size="icon-sm"
              className={cn("rounded-lg text-sm text-muted-foreground", page === catalogPagination.activePage && "bg-primary/20 text-foreground hover:bg-primary/20")}>
              {page}
            </Button>
          ))}
        </div>
        <Button type="button" variant="outline" className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none">
          {t("catalogPage.pagination.next")}
          <PaginationNextIcon className="size-4 rtl:rotate-180" />
        </Button>
      </div>

      {/* Delete Sub-Brand confirmation */}
      <DeleteConfirmDialog
        isOpen={openDialog === "delete"}
        title={t("catalogPage.subBrand.deleteDialog.title")}
        descriptionLine1={t("catalogPage.subBrand.deleteDialog.descriptionLine1")}
        descriptionLine2={t("catalogPage.subBrand.deleteDialog.descriptionLine2")}
        cancelLabel={t("catalogPage.subBrand.deleteDialog.cancel")}
        confirmLabel={t("catalogPage.subBrand.deleteDialog.confirm")}
        onClose={close}
      />

      {/* Add / Edit Sub-Brand dialog */}
      <CatalogFormDialog
        isOpen={openDialog === "add" || openDialog === "edit"}
        title={openDialog === "edit" ? t("catalogPage.subBrand.dialog.editTitle") : t("catalogPage.subBrand.dialog.title")}
        closeLabel={t("catalogPage.dialog.close")}
        cancelLabel={t("catalogPage.dialog.cancel")}
        saveLabel={t("catalogPage.dialog.save")}
        onClose={close}
        onSubmit={openDialog === "add" ? handleCreateSubBrand : undefined}
        isPending={createSubBrandMutation.isPending}
        errorMessage={formError}
      >
        <div className="space-y-1.5">
          <label htmlFor="sub-brand-parent" className="text-sm font-semibold text-foreground">
            {t("catalogPage.dialog.parentBrand")}
          </label>
          <select
            id="sub-brand-parent"
            value={brandId}
            onChange={(event) => setBrandId(event.target.value)}
            required
            className="h-11 w-full rounded-lg border border-border bg-secondary px-4 text-sm text-foreground shadow-none"
          >
            <option value="" disabled>
              {t("catalogPage.dialog.selectBrand")}
            </option>
            {(brandsQuery.data?.data ?? []).map((brand) => (
              <option key={brand.id} value={String(brand.id)}>
                {brand.name ?? `#${brand.id}`}
              </option>
            ))}
          </select>
        </div>
        <CatalogUploadArea
          label={t("catalogPage.subBrand.dialog.uploadLabel")}
          hint={t("catalogPage.dialog.uploadHint")}
          file={logo}
          onFileChange={setLogo}
        />
        <div className="space-y-1.5">
          <label htmlFor="sub-brand-name-en" className="text-sm font-semibold text-foreground">
            {t("catalogPage.subBrand.dialog.nameEnLabel")}
          </label>
          <Input id="sub-brand-name-en" type="text" value={nameEn} onChange={(event) => setNameEn(event.target.value)} required placeholder={t("catalogPage.subBrand.dialog.nameEnPlaceholder")}
            className="h-11 rounded-lg border-border bg-secondary text-sm shadow-none" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="sub-brand-name-ar" className="text-sm font-semibold text-foreground">
            {t("catalogPage.subBrand.dialog.nameArLabel")}
          </label>
          <Input id="sub-brand-name-ar" type="text" dir="rtl" value={nameAr} onChange={(event) => setNameAr(event.target.value)} required placeholder={t("catalogPage.subBrand.dialog.nameArPlaceholder")}
            className="h-11 rounded-lg border-border bg-secondary text-sm shadow-none" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground">{t("catalogPage.dialog.statusLabel")}</p>
          <CatalogStatusField
            activeLabel={t("catalogPage.dialog.statusActive")}
            description={t("catalogPage.subBrand.dialog.statusDescription")}
            ariaLabel={t("catalogPage.dialog.statusActive")}
            isActive={isActive}
            onChange={setIsActive}
          />
        </div>
      </CatalogFormDialog>

      <CatalogImportDialog isOpen={openDialog === "import"} title={t("catalogPage.import.title")} description={t("catalogPage.import.description")} downloadLabel={t("catalogPage.import.downloadLabel")} uploadLabel={t("catalogPage.import.uploadLabel")} uploadHint={t("catalogPage.import.uploadHint")} uploadFormat={t("catalogPage.import.uploadFormat")} cancelLabel={t("catalogPage.dialog.cancel")} saveLabel={t("catalogPage.dialog.save")} closeLabel={t("catalogPage.dialog.close")} onClose={close} />
    </div>
  );
}
