"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { CatalogFormDialog, CatalogStatusField } from "@/shared/components/catalog/form-dialog";
import { CatalogImportDialog } from "@/shared/components/catalog/import-dialog";
import { CatalogUploadArea } from "@/shared/components/catalog/upload-area";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { StatusToggle } from "@/shared/components/dashboard/status-toggle";
import { EmptyState, ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import {
  useAdminCatalog,
  useDeleteAdminCatalogItem,
  useDownloadAdminCatalogTemplate,
  useImportAdminCatalog,
  useSaveAdminCatalogItem,
  useUpdateAdminCatalogStatus,
} from "./hooks";
import {
  ADMIN_CATALOG_RESOURCES,
  type AdminCatalogItem,
  type AdminCatalogPayload,
  type AdminCatalogResource,
} from "./types";

const translationKeys: Record<AdminCatalogResource, "brand" | "subBrand" | "category" | "subCategory" | "product"> = {
  brand: "brand",
  "sub-brand": "subBrand",
  category: "category",
  "sub-category": "subCategory",
  product: "product",
};

function active(item: AdminCatalogItem) {
  return item.active ?? (
    item.is_active === true || item.is_active === 1 || item.is_active === "1"
  );
}

function relationName(value: AdminCatalogItem["brand"], fallback?: string | null) {
  if (typeof value === "string") return value;
  return value?.name ?? fallback ?? "—";
}

function translated(item: AdminCatalogItem, locale: string, field: "name" | "description" = "name") {
  if (Array.isArray(item.translations)) {
    return item.translations.find((value) => value.locale === locale)?.[field]
      ?? item.translations.find((value) => value.locale === "en")?.[field];
  }
  const value = item.translations?.[locale] ?? item.translations?.en;
  return typeof value === "string" ? (field === "name" ? value : undefined) : value?.[field];
}

function initialForm(item?: AdminCatalogItem): AdminCatalogPayload {
  const english = Array.isArray(item?.translations)
    ? item.translations.find((value) => value.locale === "en")
    : item?.translations?.en;
  const arabic = Array.isArray(item?.translations)
    ? item.translations.find((value) => value.locale === "ar")
    : item?.translations?.ar;
  const field = (value: typeof english, key: "name" | "description") =>
    typeof value === "string" ? (key === "name" ? value : "") : value?.[key] ?? "";
  return {
    nameEn: field(english, "name") || item?.name || "",
    nameAr: field(arabic, "name") || item?.name || "",
    descriptionEn: field(english, "description") || item?.description || "",
    descriptionAr: field(arabic, "description") || item?.description || "",
    sku: item?.sku ?? "",
    barcode: item?.barcode ?? "",
    brandId: item?.brand_id != null ? String(item.brand_id) : "",
    subBrandId: item?.sub_brand_id != null ? String(item.sub_brand_id) : "",
    categoryId: item?.category_id != null ? String(item.category_id) : "",
    subCategoryId: item?.sub_category_id != null ? String(item.sub_category_id) : "",
    isActive: item ? active(item) : true,
    logoAction: item ? "keep" : undefined,
  };
}

export function AdminCompanyCatalogPage({
  companyId,
  resource: rawResource,
}: {
  companyId: string;
  resource: string;
}) {
  if (!ADMIN_CATALOG_RESOURCES.includes(rawResource as AdminCatalogResource)) notFound();
  const resource = rawResource as AdminCatalogResource;
  return <Catalog companyId={companyId} resource={resource} />;
}

function Catalog({ companyId, resource }: { companyId: string; resource: AdminCatalogResource }) {
  const t = useTranslations("dashboard.catalogPage");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const key = translationKeys[resource];
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminCatalogItem | null | undefined>();
  const [deleting, setDeleting] = useState<AdminCatalogItem | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const params = {
    page,
    per_page: 10,
    name: deferredSearch || undefined,
    active: status === "all" ? undefined : status === "active",
  };
  const formOpen = editing !== undefined;
  const needsBrands = formOpen && resource !== "brand";
  const needsSubBrands = formOpen && (
    resource === "category" ||
    resource === "sub-category" ||
    resource === "product"
  );
  const needsCategories = formOpen && (
    resource === "sub-category" || resource === "product"
  );
  const needsSubCategories = formOpen && resource === "product";
  const catalog = useAdminCatalog(companyId, resource, params);
  const brands = useAdminCatalog(
    companyId,
    "brand",
    { per_page: 100 },
    needsBrands,
  );
  const subBrands = useAdminCatalog(
    companyId,
    "sub-brand",
    { per_page: 100 },
    needsSubBrands,
  );
  const categories = useAdminCatalog(
    companyId,
    "category",
    { per_page: 100 },
    needsCategories,
  );
  const subCategories = useAdminCatalog(
    companyId,
    "sub-category",
    { per_page: 100 },
    needsSubCategories,
  );
  const save = useSaveAdminCatalogItem();
  const remove = useDeleteAdminCatalogItem();
  const changeStatus = useUpdateAdminCatalogStatus();
  const importer = useImportAdminCatalog();
  const template = useDownloadAdminCatalogTemplate();
  const rows = catalog.data?.data ?? [];
  const current = catalog.data?.meta?.current_page ?? page;
  const last = Math.max(catalog.data?.meta?.last_page ?? 1, 1);
  const pages = useMemo(() => Array.from({ length: Math.min(last, 5) }, (_, index) => index + 1), [last]);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["admin", "companies", companyId, "catalog"] });
  }

  async function toggle(item: AdminCatalogItem) {
    setNotice(null);
    try {
      await changeStatus.mutateAsync({ companyId, resource, id: String(item.id), isActive: !active(item) });
      await refresh();
    } catch (error) {
      setNotice({ tone: "error", text: normalizeApiError(error).message });
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await remove.mutateAsync({ companyId, resource, id: String(deleting.id) });
      setDeleting(null);
      await refresh();
    } catch (error) {
      setNotice({ tone: "error", text: normalizeApiError(error).message });
    }
  }

  const columns = resource === "brand"
    ? [t(`${key}.table.columns.brandName`)]
    : resource === "sub-brand"
      ? [t(`${key}.table.columns.subBrandName`), t(`${key}.table.columns.brand`)]
      : resource === "category"
        ? [t(`${key}.table.columns.category`), t(`${key}.table.columns.brand`), t(`${key}.table.columns.subBrand`)]
        : resource === "sub-category"
          ? [t(`${key}.table.columns.subCategory`), t(`${key}.table.columns.brand`), t(`${key}.table.columns.subBrand`), t(`${key}.table.columns.category`)]
          : [t(`${key}.table.columns.products`), t(`${key}.table.columns.family`), t(`${key}.table.columns.sku`), t("fields.barcode"), t(`${key}.table.columns.description`)];

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <Button asChild variant="ghost" size="icon-sm">
            <Link href={`/admin/companies/${companyId}`}>
              <ArrowLeft className="size-5 rtl:rotate-180" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t(`${key}.title`)}</h1>
            <p className="mt-2 text-muted-foreground">{t(`${key}.subtitle`)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="size-4" />
            {t("actions.import")}
          </Button>
          <Button onClick={() => setEditing(null)}>
            <Plus className="size-4" />
            {t(`${key}.actions.add`)}
          </Button>
        </div>
      </header>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          label={t("search.label")}
          placeholder={t("search.placeholder")}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as typeof status);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-border bg-card px-3"
          aria-label={t("filters.allStatuses")}
        >
          <option value="all">{t("filters.allStatuses")}</option>
          <option value="active">{t("status.active")}</option>
          <option value="inactive">{t("status.inactive")}</option>
        </select>
      </div>
      {notice ? <p role="status" className={notice.tone === "error" ? "rounded-lg bg-destructive/10 p-3 text-destructive" : "rounded-lg bg-success/10 p-3 text-success"}>{notice.text}</p> : null}
      {catalog.isLoading ? <PageLoadingSkeleton showHeader={false} tableRows={8} tableColumns={columns.length + 3} label={t("feedback.loading")} className="p-0" /> : catalog.isError ? <ErrorState title={t("feedback.error")} description={normalizeApiError(catalog.error).message} retryLabel={t("feedback.retry")} onRetry={() => catalog.refetch()} /> : rows.length === 0 ? <EmptyState title={t("feedback.empty")} /> : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map((column) => (
                  <th key={column} className="p-4 text-start">{column}</th>
                ))}
                <th className="p-4 text-start">{t("table.columns.createdDate")}</th>
                <th className="p-4 text-start">{t("table.columns.status")}</th>
                <th className="p-4 text-start">{t("table.columns.action")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  {resource === "product" ? (
                    <>
                      <td className="p-4 font-semibold">{translated(item, locale) ?? item.name ?? "—"}</td>
                      <td className="p-4">{[
                        relationName(item.brand, item.brand_name),
                        relationName(item.sub_brand, item.sub_brand_name),
                        relationName(item.category, item.category_name),
                        relationName(item.sub_category, item.sub_category_name),
                      ].join(" › ")}</td>
                      <td className="p-4">{item.sku ?? "—"}</td>
                      <td className="p-4">{item.barcode ?? "—"}</td>
                      <td className="max-w-64 truncate p-4">{translated(item, locale, "description") ?? item.description ?? "—"}</td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 font-semibold">{translated(item, locale) ?? item.name ?? "—"}</td>
                      {resource !== "brand" ? <td className="p-4">{relationName(item.brand, item.brand_name)}</td> : null}
                      {resource === "category" || resource === "sub-category" ? <td className="p-4">{relationName(item.sub_brand, item.sub_brand_name)}</td> : null}
                      {resource === "sub-category" ? <td className="p-4">{relationName(item.category, item.category_name)}</td> : null}
                    </>
                  )}
                  <td className="p-4">{item.created_at ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(item.created_at)) : "—"}</td>
                  <td className="p-4">
                    <button type="button" onClick={() => toggle(item)} disabled={changeStatus.isPending}>
                      <StatusToggle isActive={active(item)} ariaLabel={t("table.actions.toggleStatus")} />
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditing(item)} aria-label={t("table.actions.edit")}><Pencil className="size-4" /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(item)} aria-label={t("table.actions.delete")}><Trash2 className="size-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between"><Button variant="outline" disabled={current <= 1 || catalog.isFetching} onClick={() => setPage((value) => value - 1)}>{t("pagination.previous")}</Button><div className="flex gap-1">{pages.map((value) => <Button key={value} variant="ghost" className={value === current ? "bg-primary/15" : ""} onClick={() => setPage(value)}>{value}</Button>)}</div><Button variant="outline" disabled={current >= last || catalog.isFetching} onClick={() => setPage((value) => value + 1)}>{t("pagination.next")}</Button></div>
      {editing !== undefined ? (
        <CatalogForm
          resource={resource}
          item={editing ?? undefined}
          brands={brands.data?.data ?? []}
          subBrands={subBrands.data?.data ?? []}
          categories={categories.data?.data ?? []}
          subCategories={subCategories.data?.data ?? []}
          pending={save.isPending}
          onClose={() => setEditing(undefined)}
          onSubmit={async (payload) => {
            try {
              await save.mutateAsync({
                companyId,
                resource,
                id: editing ? String(editing.id) : undefined,
                payload,
              });
              setEditing(undefined);
              setSearch("");
              setStatus("all");
              setPage(1);
              setNotice({ tone: "success", text: t("feedback.saved") });
              await refresh();
            } catch (error) {
              setNotice({ tone: "error", text: normalizeApiError(error).message });
            }
          }}
        />
      ) : null}
      {importOpen ? <ImportDialog pending={importer.isPending || template.isPending} onClose={() => setImportOpen(false)} onTemplate={async () => { try { await template.mutateAsync({ companyId, resource }); } catch (error) { setNotice({ tone: "error", text: normalizeApiError(error).message }); } }} onImport={async (file) => { try { await importer.mutateAsync({ companyId, resource, file }); setImportOpen(false); setNotice({ tone: "success", text: t("feedback.imported") }); await refresh(); } catch (error) { setNotice({ tone: "error", text: normalizeApiError(error).message }); } }} /> : null}
      <DeleteConfirmDialog isOpen={Boolean(deleting)} title={t(`${key}.deleteDialog.title`)} descriptionLine1={t(`${key}.deleteDialog.descriptionLine1`)} descriptionLine2={t(`${key}.deleteDialog.descriptionLine2`)} cancelLabel={t(`${key}.deleteDialog.cancel`)} confirmLabel={t(`${key}.deleteDialog.confirm`)} onClose={() => setDeleting(null)} onConfirm={confirmDelete} isPending={remove.isPending} />
    </div>
  );
}

function CatalogForm({ resource, item, brands, subBrands, categories, subCategories, pending, onClose, onSubmit }: { resource: AdminCatalogResource; item?: AdminCatalogItem; brands: AdminCatalogItem[]; subBrands: AdminCatalogItem[]; categories: AdminCatalogItem[]; subCategories: AdminCatalogItem[]; pending: boolean; onClose: () => void; onSubmit: (payload: AdminCatalogPayload) => Promise<void> }) {
  const t = useTranslations("dashboard.catalogPage");
  const key = translationKeys[resource];
  const [form, setForm] = useState(() => initialForm(item));
  const [error, setError] = useState("");
  const relationRequired = resource !== "brand";
  const submit = async () => {
    const valid = form.nameEn.trim() && form.nameAr.trim()
      && (!relationRequired || form.brandId)
      && (!(resource === "category" || resource === "sub-category" || resource === "product") || form.subBrandId)
      && (!(resource === "sub-category" || resource === "product") || form.categoryId)
      && (resource !== "product" || form.subCategoryId && form.sku?.trim());
    if (!valid) { setError(t("feedback.required")); return; }
    await onSubmit(form);
  };
  const select = (label: string, field: "brandId" | "subBrandId" | "categoryId" | "subCategoryId", values: AdminCatalogItem[]) => (
    <div className="space-y-2"><Label>{label}</Label><select value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="h-11 w-full rounded-lg border border-border bg-background px-3"><option value="">{label}</option>{values.map((value) => <option key={value.id} value={value.id}>{value.name ?? translated(value, "en")}</option>)}</select></div>
  );
  return (
    <CatalogFormDialog
      isOpen
      title={t(`${key}.dialog.${item ? "editTitle" : "title"}`)}
      closeLabel={t("dialog.close")}
      cancelLabel={t("dialog.cancel")}
      saveLabel={t("dialog.save")}
      onClose={onClose}
      onSubmit={submit}
      isPending={pending}
      errorMessage={error}
    >
      {relationRequired ? select(t("dialog.parentBrand"), "brandId", brands) : null}
      {resource === "category" || resource === "sub-category" || resource === "product"
        ? select(t("dialog.subBrand"), "subBrandId", subBrands.filter((value) => !form.brandId || String(value.brand_id) === form.brandId))
        : null}
      {resource === "sub-category" || resource === "product"
        ? select(t(`${key}.dialog.categoryLabel`), "categoryId", categories.filter((value) => !form.subBrandId || String(value.sub_brand_id) === form.subBrandId))
        : null}
      {resource === "product"
        ? select(t(`${key}.dialog.subCategoryLabel`), "subCategoryId", subCategories.filter((value) => !form.categoryId || String(value.category_id) === form.categoryId))
        : null}
      <div className="grid gap-4">
        <div className="space-y-2"><Label>{t(`${key}.dialog.nameLabel`)} ({t("fields.english")})</Label><Input value={form.nameEn} onChange={(event) => setForm({ ...form, nameEn: event.target.value })} /></div>
        <div className="space-y-2"><Label>{t(`${key}.dialog.nameLabel`)} ({t("fields.arabic")})</Label><Input dir="rtl" value={form.nameAr} onChange={(event) => setForm({ ...form, nameAr: event.target.value })} /></div>
      </div>
      {resource === "product" ? <>
        <div className="space-y-2"><Label>{t(`${key}.dialog.skuLabel`)}</Label><Input value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} /></div>
        <div className="space-y-2"><Label>{t("fields.barcode")}</Label><Input value={form.barcode} onChange={(event) => setForm({ ...form, barcode: event.target.value })} /></div>
        <div className="grid gap-4">
          <div className="space-y-2"><Label>{t(`${key}.dialog.descriptionLabel`)} ({t("fields.english")})</Label><textarea className="min-h-28 w-full rounded-lg border border-border bg-background p-3" value={form.descriptionEn} onChange={(event) => setForm({ ...form, descriptionEn: event.target.value })} /></div>
          <div className="space-y-2"><Label>{t(`${key}.dialog.descriptionLabel`)} ({t("fields.arabic")})</Label><textarea dir="rtl" className="min-h-28 w-full rounded-lg border border-border bg-background p-3" value={form.descriptionAr} onChange={(event) => setForm({ ...form, descriptionAr: event.target.value })} /></div>
        </div>
      </> : null}
      <CatalogUploadArea
        label={t(`${key}.dialog.uploadLabel`)}
        hint={t("dialog.uploadHint")}
        file={form.image}
        existingImageUrl={item?.logo_url ?? item?.logo ?? item?.image_url ?? item?.image}
        onFileChange={(image) => setForm({ ...form, image: image ?? undefined, logoAction: image ? "replace" : form.logoAction })}
        onRemove={item ? () => setForm({ ...form, image: undefined, logoAction: "remove" }) : undefined}
      />
      <CatalogStatusField
        activeLabel={t("dialog.statusActive")}
        description={t(`${key}.dialog.statusDescription`)}
        ariaLabel={t("table.actions.toggleStatus")}
        isActive={form.isActive}
        onChange={(isActive) => setForm({ ...form, isActive })}
      />
    </CatalogFormDialog>
  );
}

function ImportDialog({ pending, onClose, onTemplate, onImport }: { pending: boolean; onClose: () => void; onTemplate: () => Promise<void>; onImport: (file: File) => Promise<void> }) {
  const t = useTranslations("dashboard.catalogPage.import");
  const shared = useTranslations("dashboard.catalogPage");
  const [file, setFile] = useState<File | null>(null);
  return (
    <CatalogImportDialog
      isOpen
      title={t("title")}
      description={t("description")}
      downloadLabel={t("downloadLabel")}
      uploadLabel={t("uploadLabel")}
      uploadHint={t("uploadHint")}
      uploadFormat={t("uploadFormat")}
      cancelLabel={shared("dialog.cancel")}
      saveLabel={shared("dialog.save")}
      closeLabel={shared("dialog.close")}
      onClose={onClose}
      onDownload={onTemplate}
      isDownloading={pending}
      selectedFile={file}
      onFileChange={setFile}
      onImport={() => file && onImport(file)}
      isImporting={pending}
    />
  );
}
