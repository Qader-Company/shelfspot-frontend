"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

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
  CatalogSelectField,
  CatalogStatusField,
} from "./catalog-form-dialog";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { CatalogImportDialog } from "./catalog-import-dialog";
import { CatalogProductTable } from "./catalog-product-table";
import { CatalogUploadArea } from "./catalog-upload-area";
import {
  catalogBrandOptions,
  catalogCategoryOptions,
  catalogPagination,
  catalogSubBrandOptions,
  catalogSubCategoryOptions,
  productRows,
} from "./catalog.seed";

type ProductDialog = "add" | "edit" | "delete" | "import" | null;

export function ProductPage() {
  const t = useTranslations("dashboard");
  const [openDialog, setOpenDialog] = useState<ProductDialog>(null);
  const close = () => setOpenDialog(null);
  const handleDelete = () => setOpenDialog("delete");
  const handleEdit = () => setOpenDialog("edit");

  const tableLabels = {
    products:      t("catalogPage.product.table.columns.products"),
    family:        t("catalogPage.product.table.columns.family"),
    sku:           t("catalogPage.product.table.columns.sku"),
    description:   t("catalogPage.product.table.columns.description"),
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
          <h1 className="text-3xl font-bold leading-tight text-foreground">{t("catalogPage.product.title")}</h1>
          <p className="mt-2 text-lg font-medium text-muted-foreground">{t("catalogPage.product.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-medium shadow-none" onClick={() => setOpenDialog("import")}>
            <UploadIcon className="size-4" />{t("catalogPage.actions.import")}
          </Button>
          <Button type="button" className="h-10 gap-2 rounded-lg px-4 text-sm font-semibold text-white hover:text-white" onClick={() => setOpenDialog("add")}>
            <AddIcon className="size-4" />{t("catalogPage.product.actions.add")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchInput label={t("catalogPage.search.label")} placeholder={t("catalogPage.search.placeholder")} className="max-w-[400px]" />
        <Button type="button" variant="outline" className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-medium text-foreground shadow-none">
          <FilterIcon className="size-4" />{t("catalogPage.filters.allStatuses")}
        </Button>
      </div>

      <CatalogProductTable rows={productRows} labels={tableLabels} onDelete={handleDelete} onEdit={handleEdit} />

      <div className="flex flex-col items-center justify-between gap-4 px-5 pb-2 md:flex-row">
        <Button type="button" variant="outline" className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none">
          <PaginationPreviousIcon className="size-4 rtl:rotate-180" />{t("catalogPage.pagination.previous")}
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
          {t("catalogPage.pagination.next")}<PaginationNextIcon className="size-4 rtl:rotate-180" />
        </Button>
      </div>

      {/* Delete Product confirmation */}
      <DeleteConfirmDialog
        isOpen={openDialog === "delete"}
        title={t("catalogPage.product.deleteDialog.title")}
        descriptionLine1={t("catalogPage.product.deleteDialog.descriptionLine1")}
        descriptionLine2={t("catalogPage.product.deleteDialog.descriptionLine2")}
        cancelLabel={t("catalogPage.product.deleteDialog.cancel")}
        confirmLabel={t("catalogPage.product.deleteDialog.confirm")}
        onClose={close}
      />

      {/* Add / Edit Product dialog */}
      <CatalogFormDialog isOpen={openDialog === "add" || openDialog === "edit"} title={openDialog === "edit" ? t("catalogPage.product.dialog.editTitle") : t("catalogPage.product.dialog.title")} closeLabel={t("catalogPage.dialog.close")} cancelLabel={t("catalogPage.dialog.cancel")} saveLabel={t("catalogPage.dialog.save")} onClose={close}>
        <CatalogUploadArea label={t("catalogPage.product.dialog.uploadLabel")} hint={t("catalogPage.dialog.uploadHint")} />
        <div className="grid grid-cols-2 gap-4">
          <CatalogSelectField label={t("catalogPage.dialog.parentBrand")} placeholder={t("catalogPage.dialog.selectBrand")} options={catalogBrandOptions} />
          <CatalogSelectField label={t("catalogPage.dialog.subBrand")} placeholder={t("catalogPage.dialog.selectSubBrand")} options={catalogSubBrandOptions} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <CatalogSelectField label={t("catalogPage.product.dialog.categoryLabel")} placeholder={t("catalogPage.product.dialog.selectCategory")} options={catalogCategoryOptions} />
          <CatalogSelectField label={t("catalogPage.product.dialog.subCategoryLabel")} placeholder={t("catalogPage.product.dialog.selectSubCategory")} options={catalogSubCategoryOptions} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">{t("catalogPage.product.dialog.nameLabel")}</label>
          <Input type="text" placeholder={t("catalogPage.product.dialog.namePlaceholder")} className="h-11 rounded-lg border-border bg-secondary text-sm shadow-none" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">{t("catalogPage.product.dialog.skuLabel")}</label>
          <Input type="text" placeholder={t("catalogPage.product.dialog.skuPlaceholder")} className="h-11 rounded-lg border-border bg-secondary text-sm shadow-none" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">{t("catalogPage.product.dialog.descriptionLabel")}</label>
          <textarea
            placeholder={t("catalogPage.product.dialog.descriptionPlaceholder")}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground shadow-none placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground">{t("catalogPage.dialog.statusLabel")}</p>
          <CatalogStatusField activeLabel={t("catalogPage.dialog.statusActive")} description={t("catalogPage.product.dialog.statusDescription")} ariaLabel={t("catalogPage.dialog.statusActive")} />
        </div>
      </CatalogFormDialog>

      <CatalogImportDialog isOpen={openDialog === "import"} title={t("catalogPage.import.title")} description={t("catalogPage.import.description")} downloadLabel={t("catalogPage.import.downloadLabel")} uploadLabel={t("catalogPage.import.uploadLabel")} uploadHint={t("catalogPage.import.uploadHint")} uploadFormat={t("catalogPage.import.uploadFormat")} cancelLabel={t("catalogPage.dialog.cancel")} saveLabel={t("catalogPage.dialog.save")} closeLabel={t("catalogPage.dialog.close")} onClose={close} />
    </div>
  );
}
