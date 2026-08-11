"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { useCreateTaskMutation } from "@/modules/company/requests/create/use-create-mutation";
import { toTaskFormData } from "@/modules/company/requests/create/service";
import { useTaskMutations, useTaskQuery } from "@/modules/company/requests/details/use-query";
import { useServicesQuery } from "@/modules/company/requests/create/use-query";
import { useProductsQuery } from "@/modules/company/catalog/products/use-query";
import { useBrandsQuery } from "@/modules/company/catalog/brands/use-query";
import { useSubBrandsQuery } from "@/modules/company/catalog/sub-brands/use-query";
import { useCategoriesQuery } from "@/modules/company/catalog/categories/hooks";
import { useSubCategoriesQuery } from "@/modules/company/catalog/sub-categories/hooks";
import type { CompanyService } from "@/modules/company/requests/create/types";
import type { CompanyProduct } from "@/modules/company/catalog/products/types";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { useDialogPresence } from "@/shared/hooks/use-dialog-presence";

import { createRequestSteps } from "@/modules/company/requests/create/seed";
import { CreateRequestLayout } from "@/modules/company/requests/create/layout";
import { CreateRequestStepper } from "@/modules/company/requests/create/stepper";
import { FlowDialog } from "@/shared/components/flow-dialog";
import { PaymentConfirmDialog } from "@/modules/company/requests/shared/payment-confirm-dialog";
import { AnalogClockFace } from "@/shared/components/analog-clock-face";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CloseIcon,
  CostIcon,
  EditIcon,
  MapPinIcon,
  PaginationNextIcon,
  PaginationPreviousIcon,
  SidebarChevronIcon,
  TrashIcon,
  UploadIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";

type DashboardTranslate = ReturnType<typeof useTranslations<"dashboard">>;
type DialogName = "date" | "time" | "location" | "payment" | "success" | null;

// ─── Schema — location only ───────────────────────────────────────────────────

function createRequestSchema(t: DashboardTranslate) {
  return z.object({
    executionDate: z.string().min(1, t("createRequest.validation.executionDateRequired")),
    executionDateIso: z.string().min(1, t("createRequest.validation.executionDateRequired")),
    executionTime: z.string().min(1, t("createRequest.validation.executionTimeRequired")),
    storeName: z.string().min(1, t("createRequest.validation.storeRequired")),
    streetAddress: z.string().min(1, t("createRequest.validation.streetAddressRequired")),
    latitude: z.number({ error: t("createRequest.validation.storeRequired") }).min(-90).max(90),
    longitude: z.number({ error: t("createRequest.validation.storeRequired") }).min(-180).max(180),
  });
}

// ─── Per-service entry ────────────────────────────────────────────────────────

interface ServiceEntry {
  id: string;
  serviceKey: string;
  price: number;
  executionTimeMins: number;
  brand: string; subBrand: string; category: string; subCategory: string; search: string;
  productIds: number[];
  productDetails: Record<number, Record<string, string>>;
  planogramFiles: File[]; jobOrderFiles: File[];
  instructions: string;
  page: number;
  isExpanded: boolean;
}

function makeEmptyEntry(): ServiceEntry {
  return {
    id: Math.random().toString(36).slice(2),
    serviceKey: "", price: 0, executionTimeMins: 0,
    brand: "", subBrand: "", category: "", subCategory: "", search: "",
    productIds: [], productDetails: {},
    planogramFiles: [], jobOrderFiles: [],
    instructions: "", page: 1, isExpanded: true,
  };
}

type CreateRequestFormValues = z.infer<ReturnType<typeof createRequestSchema>>;
type LocationFormValues = Pick<CreateRequestFormValues,
  "storeName" | "streetAddress" | "latitude" | "longitude"
>;

const defaultValues: CreateRequestFormValues = {
  executionDate: "", executionDateIso: "", executionTime: "",
  storeName: "", streetAddress: "",
  latitude: 0, longitude: 0,
};

// ─── Main component ───────────────────────────────────────────────────────────

export function CreateRequestPage({ taskId, repeatTaskId }: { taskId?: string | number; repeatTaskId?: string | number }) {
  const t = useTranslations("dashboard");
  const [openDialog, setOpenDialog] = useState<DialogName>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isLocationExpanded, setIsLocationExpanded] = useState(true);
  const [isServiceExpanded, setIsServiceExpanded] = useState(true);
  const [serviceEntries, setServiceEntries] = useState<ServiceEntry[]>([makeEmptyEntry()]);

  const locationSectionRef = useRef<HTMLElement | null>(null);
  const serviceSectionRef = useRef<HTMLElement | null>(null);

  const createTaskMutation = useCreateTaskMutation();
  const sourceTaskId = taskId ?? repeatTaskId;
  const taskQuery = useTaskQuery(sourceTaskId ?? "");
  const { update: updateTaskMutation } = useTaskMutations();
  const hydratedTaskId = useRef<string | number | null>(null);
  const servicesQuery = useServicesQuery();
  const allServices = servicesQuery.data?.data ?? [];

  const schema = useMemo(() => createRequestSchema(t), [t]);
  const form = useForm<CreateRequestFormValues>({ resolver: zodResolver(schema), defaultValues, mode: "onTouched" });
  const values = useWatch({ control: form.control });
  const hasLocation = Boolean(values.storeName);

  const brandsQuery = useBrandsQuery({ per_page: 100, page: 1 });
  const brandOptions = brandsQuery.data?.data ?? [];

  const sectionRefs = useMemo(() => [locationSectionRef, serviceSectionRef], []);

  useEffect(() => {
    const task = taskQuery.data?.data;
    if (!sourceTaskId || !task || (taskId && task.status !== "draft") || hydratedTaskId.current === task.id) return;
    hydratedTaskId.current = task.id;
    const address = task.location.address ?? "";
    form.reset({
      executionDate: repeatTaskId ? "" : task.date.slice(0, 10),
      executionDateIso: repeatTaskId ? "" : task.date.slice(0, 10),
      executionTime: "09:00 AM",
      storeName: task.location.location_name ?? address, streetAddress: address,
      latitude: Number(task.location.latitude), longitude: Number(task.location.longitude),
    });
    setServiceEntries(task.services.map((item) => ({
      ...makeEmptyEntry(), id: String(item.id), serviceKey: item.service.key,
      price: Number(item.unit_price), executionTimeMins: item.service.minimum_execution_time ?? 0,
      instructions: item.execution_instructions ?? "", productIds: item.products.map((product) => product.product.id),
      productDetails: Object.fromEntries(item.products.map((product) => [product.product.id, Array.isArray(product.product_details) ? {} : Object.fromEntries(Object.entries(product.product_details).map(([key, value]) => [key, value == null ? "" : String(value)]))])),
    })));
  }, [form, repeatTaskId, sourceTaskId, taskId, taskQuery.data]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = Number((visible.target as HTMLElement).dataset.stepIndex);
        if (!Number.isNaN(idx)) setActiveStepIndex(idx);
      },
      { root: null, rootMargin: "-20% 0px -55% 0px", threshold: [0.2, 0.4, 0.6, 0.8] },
    );
    sectionRefs.forEach((r) => { if (r.current) observer.observe(r.current); });
    return () => observer.disconnect();
  }, [sectionRefs]);

  function resetRequest() {
    form.reset(defaultValues);
    createTaskMutation.reset();
    setServiceEntries([makeEmptyEntry()]);
    setIsLocationExpanded(true);
    setIsServiceExpanded(true);
  }

  function goToStep(index: number) {
    setActiveStepIndex(index);
    if (index === 0) setIsLocationExpanded(true);
    if (index === 1) setIsServiceExpanded(true);
    window.requestAnimationFrame(() => { sectionRefs[index]?.current?.scrollIntoView({ behavior: "smooth", block: "start" }); });
  }

  function saveLocation(locationValues: LocationFormValues) {
    Object.entries(locationValues).forEach(([key, val]) => {
      form.setValue(key as keyof LocationFormValues, val as string & number, { shouldDirty: true, shouldValidate: true });
    });
    setOpenDialog(null);
  }

  function updateEntry(id: string, patch: Partial<ServiceEntry>) {
    setServiceEntries((prev) => prev.map((e) => e.id === id ? { ...e, ...patch } : e));
  }
  function addService() { setServiceEntries((prev) => [...prev, makeEmptyEntry()]); }
  function removeEntry(id: string) { setServiceEntries((prev) => prev.length > 1 ? prev.filter((e) => e.id !== id) : prev); }
  function submitForPayment() { setOpenDialog("payment"); }

  async function confirmPayment() {
    const vals = form.getValues();
    try {
      const payload = {
          date: vals.executionDateIso,
          location: { latitude: vals.latitude, longitude: vals.longitude, location_name: vals.storeName || null, address: vals.streetAddress || null },
          notes: serviceEntries[0]?.instructions || null,
          services: serviceEntries.map((entry) => ({
            service_key: entry.serviceKey, price: entry.price, execution_time_minutes: entry.executionTimeMins,
            execution_instructions: entry.instructions || null,
            products: entry.productIds.map((id) => ({ product_id: id, product_details: entry.productDetails[id] ?? {} })),
            planogramFiles: entry.planogramFiles, jobOrderFiles: entry.jobOrderFiles,
          })),
        };
      if (taskId) await updateTaskMutation.mutateAsync({ id: taskId, payload: toTaskFormData(payload) });
      else await createTaskMutation.mutateAsync({ companySlug: "", payload });
      setOpenDialog("success");
    } catch (error) {
      const apiError = normalizeApiError(error);
      const message = apiError.status === 401 ? t("createRequest.errors.unauthorized")
        : apiError.status === 403 ? t("createRequest.errors.forbidden")
        : apiError.status === 422 ? apiError.message
        : t("createRequest.errors.generic");
      form.setError("root", { message });
      setOpenDialog(null);
    }
  }

  const totalPrice = serviceEntries.reduce((sum, e) => sum + (e.price || 0), 0);

  return (
    <>
      <CreateRequestLayout
        title={t("createRequest.title")}
        subtitle={t("createRequest.subtitle")}
        stepper={
          <CreateRequestStepper steps={createRequestSteps} activeStepIndex={activeStepIndex} resolveLabel={(key) => t(key)} onStepClick={goToStep} />
        }
        navigation={
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" className="h-12 rounded-lg border-border bg-card px-8 text-sm font-semibold shadow-none" onClick={resetRequest}>
              {t("createRequest.actions.cancel")}
            </Button>
            <Button type="button" className="h-12 rounded-lg px-8 text-sm font-semibold text-primary-foreground hover:text-primary-foreground" onClick={form.handleSubmit(submitForPayment)}>
              {t("createRequest.actions.submit")}
            </Button>
          </div>
        }
      >
        <Form {...form}>
          <form className="space-y-5" noValidate>
            {form.formState.errors.root?.message ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
            ) : null}

            {/* ── Location ── */}
            <SectionCard sectionRef={locationSectionRef} stepIndex={0} title={t("createRequest.location.title")} description={t("createRequest.location.description")} isExpanded={isLocationExpanded} toggleLabel={t("createRequest.actions.toggleSection")} onToggle={() => setIsLocationExpanded((c) => !c)}>
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{t("createRequest.location.executionDateTime")}<RequiredMark /></h3>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <PickerField label={t("createRequest.fields.executionDate.label")} icon="calendar" value={values.executionDate || t("createRequest.fields.executionDate.placeholder")} onClick={() => setOpenDialog("date")} />
                    <PickerField label={t("createRequest.fields.executionTime.label")} icon="clock" value={values.executionTime || t("createRequest.fields.executionTime.placeholder")} onClick={() => setOpenDialog("time")} />
                  </div>
                  <div className="grid gap-1 md:grid-cols-2">
                    <HiddenFieldMessage name="executionDate" />
                    <HiddenFieldMessage name="executionTime" />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-primary">{t("createRequest.location.scheduleHint")}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{t("createRequest.location.storeLocation")}</h3>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">{t("createRequest.location.storeDescription")}</p>
                  <button type="button" className="mt-4 flex w-full items-center gap-4 rounded-xl border border-primary bg-background p-4 text-start transition hover:bg-primary/5" onClick={() => setOpenDialog("location")}>
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><MapPinIcon className="size-5" /></span>
                    <span>
                      <span className="block text-sm font-bold text-foreground">{hasLocation ? values.storeName : t("createRequest.location.addLocation")}</span>
                      <span className="mt-1 block text-xs font-medium leading-5 text-muted-foreground">{hasLocation ? values.streetAddress : t("createRequest.location.addLocationDescription")}</span>
                    </span>
                  </button>
                  <HiddenFieldMessage name="storeName" />
                </div>
              </div>
            </SectionCard>

            {/* ── Services ── */}
            <SectionCard
              sectionRef={serviceSectionRef}
              stepIndex={1}
              title={t("createRequest.services.title")}
              description={t("createRequest.services.description")}
              isExpanded={isServiceExpanded}
              toggleLabel={t("createRequest.actions.toggleSection")}
              onToggle={() => setIsServiceExpanded((c) => !c)}
              action={
                <Button type="button" onClick={addService} className="h-9 rounded-lg px-4 text-sm font-semibold text-primary-foreground hover:text-primary-foreground">
                  <span className="me-1 text-base leading-none">+</span>
                  {t("createRequest.actions.addService")}
                </Button>
              }
            >
              <div className="space-y-4">
                {serviceEntries.map((entry, index) => (
                  <ServiceEntryCard
                    key={entry.id}
                    t={t}
                    index={index}
                    entry={entry}
                    allServices={allServices}
                    isLoadingServices={servicesQuery.isPending}
                    brandOptions={brandOptions}
                    canRemove={serviceEntries.length > 1}
                    onUpdate={(patch) => updateEntry(entry.id, patch)}
                    onRemove={() => removeEntry(entry.id)}
                  />
                ))}
                {totalPrice > 0 ? (
                  <TotalCostCard
                    label={t("createRequest.cost.title")}
                    description={serviceEntries.filter((e) => e.serviceKey).map((e) => allServices.find((s) => s.key === e.serviceKey)?.name ?? e.serviceKey).join(", ")}
                    amount={`${totalPrice} SAR`}
                  />
                ) : null}
              </div>
            </SectionCard>
          </form>
        </Form>
      </CreateRequestLayout>

      {/* ── Dialogs ── */}
      {openDialog === "date" ? (
        <DateDialog t={t} isOpen onClose={() => setOpenDialog(null)} onSelect={(display, iso) => { form.setValue("executionDate", display, { shouldDirty: true, shouldValidate: true }); form.setValue("executionDateIso", iso, { shouldDirty: true, shouldValidate: true }); setOpenDialog(null); }} />
      ) : null}
      {openDialog === "time" ? (
        <TimeDialog t={t} isOpen onClose={() => setOpenDialog(null)} value={values.executionTime ?? ""} onSelect={(time) => { form.setValue("executionTime", time, { shouldDirty: true, shouldValidate: true }); }} />
      ) : null}
      {openDialog === "location" ? (
        <LocationDialog t={t} isOpen initialValues={{ storeName: values.storeName ?? "", streetAddress: values.streetAddress ?? "", latitude: values.latitude ?? 0, longitude: values.longitude ?? 0 }} onClose={() => setOpenDialog(null)} onSave={saveLocation} />
      ) : null}
      <PaymentConfirmDialog
        isOpen={openDialog === "payment"}
        isPending={createTaskMutation.isPending || updateTaskMutation.isPending}
        totalPrice={totalPrice}
        onClose={() => setOpenDialog(null)}
        onConfirm={confirmPayment}
      />
      <FlowDialog title={t("createRequest.success.title")} closeLabel={t("createRequest.actions.closeDialog")} isOpen={openDialog === "success"} onClose={() => setOpenDialog(null)} footer={<Button type="button" className="h-11 w-full rounded-lg text-sm font-semibold" onClick={() => setOpenDialog(null)}>{t("createRequest.success.action")}</Button>}>
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"><CheckCircleIcon className="size-7" /></span>
          <p className="mt-4 text-sm font-medium leading-6 text-muted-foreground">{t("createRequest.success.description")}</p>
        </div>
      </FlowDialog>
    </>
  );
}

// ─── ServiceEntryCard ─────────────────────────────────────────────────────────

function ServiceEntryCard({
  t, index, entry, allServices, isLoadingServices, brandOptions, canRemove, onUpdate, onRemove,
}: {
  t: DashboardTranslate;
  index: number;
  entry: ServiceEntry;
  allServices: CompanyService[];
  isLoadingServices: boolean;
  brandOptions: { id: string | number; name?: string }[];
  canRemove: boolean;
  onUpdate: (patch: Partial<ServiceEntry>) => void;
  onRemove: () => void;
}) {
  const selectedService = allServices.find((s) => s.key === entry.serviceKey) ?? null;

  const subBrandsQuery = useSubBrandsQuery({ per_page: 100, page: 1, brand_id: entry.brand || undefined });
  const categoriesQuery = useCategoriesQuery({ per_page: 100, page: 1, brand_id: entry.brand || undefined, sub_brand_id: entry.subBrand || undefined });
  const subCategoriesQuery = useSubCategoriesQuery({ per_page: 100, page: 1, brand_id: entry.brand || undefined, sub_brand_id: entry.subBrand || undefined, category_id: entry.category || undefined });

  const subBrandOptions = entry.brand ? (subBrandsQuery.data?.data ?? []) : [];
  const categoryOptions = entry.subBrand ? (categoriesQuery.data?.data ?? []) : [];
  const subCategoryOptions = entry.category ? (subCategoriesQuery.data?.data ?? []) : [];

  const productsQuery = useProductsQuery({
    brand_id: entry.brand || undefined,
    sub_brand_id: entry.subBrand || undefined,
    category_id: entry.category || undefined,
    sub_category_id: entry.subCategory || undefined,
    name: entry.search || undefined,
    page: entry.page,
    per_page: 15,
  }, { enabled: Boolean(entry.subCategory) });

  const extraColumn: { key: string; type: string } | null = useMemo(() => {
    if (!selectedService) return null;
    const rootForm = selectedService.product_details_form;
    const rootFields = !Array.isArray(rootForm) && rootForm && typeof rootForm === "object" ? rootForm.fields : null;
    const nestedFields = selectedService.request_form?.product_details_form?.fields ?? null;
    const fields = rootFields ?? nestedFields;
    if (!fields) return null;
    const e = Object.entries(fields)[0];
    return e ? { key: e[0], type: e[1].type } : null;
  }, [selectedService]);

  const showPlanogramUpload = useMemo(() => Object.values(selectedService?.request_form?.fields ?? {}).some((f) => f.attachment_type === "planogram"), [selectedService]);
  const showJobOrderUpload = useMemo(() => Object.values(selectedService?.request_form?.fields ?? {}).some((f) => f.attachment_type === "job_order"), [selectedService]);

  const products = productsQuery.data?.data ?? [];
  const productsMeta = productsQuery.data?.meta;

  function handleServiceKeyChange(key: string) {
    const service = allServices.find((item) => item.key === key);
    onUpdate({
      serviceKey: key,
      price: Number(service?.price ?? service?.minimum_price ?? 0),
      executionTimeMins: Number(service?.minimum_execution_time ?? 0),
      productIds: [], productDetails: {},
      brand: "", subBrand: "", category: "", subCategory: "", search: "", page: 1,
    });
  }
  function toggleProduct(productId: number) {
    const next = entry.productIds.includes(productId)
      ? entry.productIds.filter((id) => id !== productId)
      : [...entry.productIds, productId];
    onUpdate({ productIds: next });
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-foreground">{t("createRequest.services.serviceLabel", { index: index + 1 })}</h3>
          {entry.price > 0 ? <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500">{entry.price} SAR</span> : null}
        </div>
        <div className="flex items-center gap-2">
          {canRemove ? (
            <Button type="button" variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground hover:text-destructive" onClick={onRemove} aria-label={t("createRequest.actions.removeService")}>
              <TrashIcon className="size-4" />
            </Button>
          ) : null}
          <Button type="button" variant="ghost" size="icon-lg" className="rounded-full bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" aria-label={t("createRequest.actions.toggleSection")} onClick={() => onUpdate({ isExpanded: !entry.isExpanded })}>
            <PaginationNextIcon className={cn("size-4 rotate-90 transition", entry.isExpanded && "-rotate-90")} />
          </Button>
        </div>
      </div>

      {/* Body */}
      {entry.isExpanded ? (
        <div className="space-y-4 border-t border-border px-5 pb-5 pt-4">
          {/* Service type */}
          <div>
            <label className="mb-1.5 block text-base font-bold text-foreground">{t("createRequest.fields.serviceType.label")}</label>
            <select value={entry.serviceKey} disabled={isLoadingServices} className="h-12 w-full rounded-lg border border-input bg-background px-4 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50" onChange={(e) => handleServiceKeyChange(e.target.value)}>
              <option value="">{isLoadingServices ? t("createRequest.states.loading") : t("createRequest.fields.serviceType.placeholder")}</option>
              {allServices.map((svc) => <option key={svc.key} value={svc.key}>{svc.name}</option>)}
            </select>
          </div>

          {/* Brand / SubBrand / Category / SubCategory */}
          <div className="grid gap-4 lg:grid-cols-4">
            {[
              { label: t("createRequest.fields.brand.label"), value: entry.brand, options: brandOptions, disabled: false, onChange: (v: string) => onUpdate({ brand: v, subBrand: "", category: "", subCategory: "", productIds: [], page: 1 }) },
              { label: t("createRequest.fields.subBrand.label"), value: entry.subBrand, options: subBrandOptions, disabled: !entry.brand, onChange: (v: string) => onUpdate({ subBrand: v, category: "", subCategory: "", productIds: [], page: 1 }) },
              { label: t("createRequest.fields.category.label"), value: entry.category, options: categoryOptions, disabled: !entry.subBrand, onChange: (v: string) => onUpdate({ category: v, subCategory: "", productIds: [], page: 1 }) },
              { label: t("createRequest.fields.subCategory.label"), value: entry.subCategory, options: subCategoryOptions, disabled: !entry.category, onChange: (v: string) => onUpdate({ subCategory: v, productIds: [], page: 1 }) },
            ].map(({ label, value, options, disabled, onChange }) => (
              <div key={label}>
                <label className="mb-1.5 block text-base font-bold text-foreground">{label}</label>
                <select value={value} disabled={disabled} className="h-12 w-full rounded-lg border border-border bg-card px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50" onChange={(e) => onChange(e.target.value)}>
                  <option value="">—</option>
                  {options.map((o) => <option key={o.id} value={String(o.id)}>{o.name ?? `#${o.id}`}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Product table */}
          <ProductTable
            t={t}
            products={products}
            isLoading={productsQuery.isPending}
            isError={productsQuery.isError}
            selectedProductIds={entry.productIds}
            extraColumn={extraColumn}
            productDetails={entry.productDetails}
            onDetailChange={(productId, fieldKey, val) => onUpdate({ productDetails: { ...entry.productDetails, [productId]: { ...(entry.productDetails[productId] ?? {}), [fieldKey]: val } } })}
            meta={productsMeta}
            page={entry.page}
            onPageChange={(p) => onUpdate({ page: p })}
            onToggle={toggleProduct}
            search={entry.search}
            onSearchChange={(s) => onUpdate({ search: s, page: 1 })}
          />

          {/* Documents & Guidelines */}
          <div className="space-y-4 rounded-xl border border-border p-4">
            <h4 className="text-base font-bold text-foreground">{t("createRequest.guidelines.title")}</h4>
            {showPlanogramUpload ? (
              <EntryFileUpload t={t} label={t("createRequest.fields.planogramFiles.label")} accept="application/pdf,image/*" acceptLabel={t("createRequest.fields.planogramFiles.accept")} files={entry.planogramFiles} onChange={(files) => onUpdate({ planogramFiles: files })} />
            ) : null}
            {showJobOrderUpload ? (
              <EntryFileUpload t={t} label={t("createRequest.fields.jobOrderFiles.label")} accept="application/pdf,image/*,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" acceptLabel={t("createRequest.fields.jobOrderFiles.accept")} files={entry.jobOrderFiles} onChange={(files) => onUpdate({ jobOrderFiles: files })} />
            ) : null}
            <div>
              <label className="mb-1.5 block text-base font-bold text-foreground">{t("createRequest.fields.instructions.label")}</label>
              <p className="mb-2 text-xs text-muted-foreground">{t("createRequest.fields.instructions.description")}</p>
              <textarea className="min-h-28 w-full rounded-lg border border-input bg-transparent px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" placeholder={t("createRequest.fields.instructions.placeholder")} value={entry.instructions} onChange={(e) => onUpdate({ instructions: e.target.value })} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─── EntryFileUpload (uncontrolled, no react-hook-form) ───────────────────────

function EntryFileUpload({ t, label, accept, acceptLabel, files, onChange }: {
  t: DashboardTranslate; label: string; accept: string; acceptLabel: string;
  files: File[]; onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const selected = Array.from(input.files ?? []).filter((file) => file.size <= 10 * 1024 * 1024);
    const merged = [...files, ...selected.filter((incoming) =>
      !files.some((existing) => existing.name === incoming.name && existing.size === incoming.size),
    )];
    input.value = "";
    onChange(merged);
  }
  return (
    <div>
      <label className="mb-1.5 block text-base font-bold text-foreground">{label}</label>
      <button type="button" className="flex w-full cursor-pointer flex-col items-center rounded-lg border border-dashed border-border px-5 py-5 text-center transition hover:border-primary/50 hover:bg-primary/5" onClick={() => inputRef.current?.click()}>
        <UploadIcon className="size-5 text-foreground" />
        <p className="mt-2 text-sm font-bold text-foreground">{t("createRequest.guidelines.uploadTitle")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("createRequest.guidelines.uploadDescription")}</p>
        <p className="mt-1.5 text-xs font-semibold text-primary">{acceptLabel}</p>
      </button>
      <input ref={inputRef} type="file" className="hidden" multiple accept={accept} onClick={(event) => { event.currentTarget.value = ""; }} onChange={handleSelect} />
      {files.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {files.map((file) => (
            <li key={file.name} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-4 py-2">
              <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
              <Button type="button" variant="ghost" size="icon-sm" className="shrink-0 rounded-full text-muted-foreground hover:text-destructive" aria-label={t("createRequest.guidelines.removeFile")} onClick={() => onChange(files.filter((f) => f.name !== file.name))}>
                <CloseIcon className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({ sectionRef, stepIndex, title, description, action, isExpanded, toggleLabel, children, onToggle }: {
  sectionRef?: React.Ref<HTMLElement>; stepIndex?: number; title: string; description: string;
  action?: React.ReactNode; isExpanded: boolean; toggleLabel: string; children: React.ReactNode; onToggle: () => void;
}) {
  return (
    <section ref={sectionRef} data-step-index={stepIndex} className="scroll-mt-28 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          {action}
          <Button type="button" size="icon-lg" variant="ghost" className="rounded-full bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" aria-label={toggleLabel} onClick={onToggle}>
            <PaginationNextIcon className={cn("size-4 rotate-90 transition", isExpanded && "-rotate-90")} />
          </Button>
        </div>
      </div>
      {isExpanded ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

// ─── ProductTable ─────────────────────────────────────────────────────────────

function ProductTable({
  t, products, isLoading, isError, selectedProductIds, extraColumn, productDetails,
  onDetailChange, meta, page, onPageChange, onToggle, search, onSearchChange,
}: {
  t: DashboardTranslate; products: CompanyProduct[]; isLoading: boolean; isError: boolean;
  selectedProductIds: number[]; extraColumn: { key: string; type: string } | null;
  productDetails: Record<number, Record<string, string>>;
  onDetailChange: (productId: number, fieldKey: string, value: string) => void;
  meta?: { current_page: number; last_page: number; per_page: number; total: number };
  page: number; onPageChange: (p: number) => void; onToggle: (id: number) => void;
  search: string; onSearchChange: (s: string) => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const totalPages = meta?.last_page ?? 1;
  const extraColumnLabel = extraColumn
    ? extraColumn.key === "minimum_quantity" ? t("createRequest.productTable.columns.minQuantity")
      : extraColumn.key === "expected_expiry_date" ? t("createRequest.productTable.columns.expiryDate")
      : extraColumn.key.replace(/_/g, " ")
    : null;
  const totalCols = extraColumn ? 5 : 4;

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input className="h-11 flex-1 rounded-lg px-4 text-sm" placeholder={t("createRequest.productTable.searchPlaceholder")} value={search} onChange={(e) => onSearchChange(e.target.value)} />
        <span className="text-sm font-bold text-primary">{meta ? `${meta.total} ` : ""}{t("createRequest.productTable.showProducts")}</span>
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead className="bg-muted/30 text-xs font-semibold text-muted-foreground">
            <tr>
              <th className="w-12 border-b border-e border-border px-4 py-3 text-start"><input type="checkbox" className="size-4 accent-primary" readOnly /></th>
              <th className="border-b border-e border-border px-4 py-3 text-start">{t("createRequest.productTable.columns.products")}</th>
              <th className="border-b border-e border-border px-4 py-3 text-center">{t("createRequest.productTable.columns.sku")}</th>
              <th className={cn("border-b border-border px-4 py-3 text-center", extraColumn && "border-e")}>{t("createRequest.productTable.columns.barcode")}</th>
              {extraColumnLabel ? <th className="border-b border-border px-4 py-3 text-center">{extraColumnLabel}</th> : null}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={totalCols} className="px-4 py-8 text-center text-sm text-muted-foreground">{t("createRequest.states.loading")}</td></tr>
            ) : isError ? (
              <tr><td colSpan={totalCols} className="px-4 py-8 text-center text-sm text-destructive">{t("createRequest.errors.loadProducts")}</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={totalCols} className="px-4 py-8 text-center text-sm text-muted-foreground">{t("createRequest.productTable.noProducts")}</td></tr>
            ) : products.map((product) => {
              const isSelected = selectedProductIds.includes(product.id);
              const detailValue = productDetails[product.id]?.[extraColumn?.key ?? ""] ?? "";
              const isEditing = editingId === product.id;
              return (
                <tr key={product.id} className="border-b border-border last:border-b-0">
                  <td className="border-e border-border px-4 py-4"><input type="checkbox" className="size-4 accent-primary" checked={isSelected} onChange={() => onToggle(product.id)} /></td>
                  <td className="border-e border-border px-4 py-4">
                    <div className="flex items-center gap-3"><ProductThumbnail imageUrl={product.image_url} /><span className="font-semibold text-foreground">{product.name}</span></div>
                  </td>
                  <td className="border-e border-border px-4 py-4 text-center text-muted-foreground">{product.sku}</td>
                  <td className={cn("px-4 py-4 text-center text-muted-foreground", extraColumn && "border-e border-border")}>{product.barcode ?? "—"}</td>
                  {extraColumn ? (
                    <td className="px-4 py-4 text-center">
                      {isEditing ? (
                        <input autoFocus type={extraColumn.type === "integer" ? "number" : "date"} min={extraColumn.type === "integer" ? 1 : undefined} value={detailValue}
                          onChange={(e) => onDetailChange(product.id, extraColumn.key, e.target.value)}
                          onBlur={() => setEditingId(null)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditingId(null); }}
                          className="h-9 w-32 rounded-lg border border-primary bg-background px-3 text-center text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-medium text-foreground">{detailValue || "—"}</span>
                          <button type="button" aria-label={t("createRequest.productTable.editDetail")} onClick={() => setEditingId(product.id)} className="text-primary transition hover:text-primary/70"><EditIcon className="size-4" /></button>
                        </div>
                      )}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-4">
          <Button type="button" variant="outline" className="h-10 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <PaginationPreviousIcon className="size-4 rtl:rotate-180" />{t("createRequest.pagination.previous")}
          </Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button type="button" variant="outline" className="h-10 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            {t("createRequest.pagination.next")}<PaginationNextIcon className="size-4 rtl:rotate-180" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

// ─── Primitive helpers ────────────────────────────────────────────────────────

function TotalCostCard({ label, description, amount }: { label: string; description: string; amount: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/10 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-background text-primary"><CostIcon className="size-5" /></span>
        <div><p className="text-sm font-bold text-foreground">{label}</p><p className="text-xs font-medium text-muted-foreground">{description}</p></div>
      </div>
      <span className="rounded-full bg-primary/10 px-4 py-2 text-lg font-bold text-primary">{amount}</span>
    </div>
  );
}

function HiddenFieldMessage({ name }: { name: keyof CreateRequestFormValues }) {
  return <FormField name={name} render={() => <FormItem><FormMessage /></FormItem>} />;
}

function PickerField({ label, icon, value, onClick }: { label: string; icon: "calendar" | "clock"; value: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} className="flex h-12 w-full items-center justify-between rounded-lg border border-input px-4 text-start text-sm font-medium text-muted-foreground transition hover:border-primary/50" onClick={onClick}>
      {value}
      <span className="text-primary">{icon === "calendar" ? <CalendarIcon className="size-5" /> : <ClockIcon className="size-5" />}</span>
    </button>
  );
}

function ProductThumbnail({ imageUrl }: { imageUrl?: string | null }) {
  if (imageUrl) return <img src={imageUrl} alt="" aria-hidden="true" className="size-8 shrink-0 rounded-sm object-cover" />;
  return (
    <span className="grid size-8 shrink-0 grid-cols-3 gap-0.5 rounded-sm bg-slate-950 p-1">
      <span className="rounded-sm bg-slate-100" /><span className="rounded-sm bg-red-500" /><span className="rounded-sm bg-slate-100" />
      <span className="rounded-sm bg-slate-100" /><span className="rounded-sm bg-red-500" /><span className="rounded-sm bg-slate-100" />
    </span>
  );
}

function RequiredMark() { return <span className="text-destructive">*</span>; }

function PaymentRow({ label, value, tone }: { label: string; value: string; tone?: "danger" | "success" }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0">
      <span className="font-medium text-foreground">{label}</span>
      <span className={cn("font-bold text-foreground", tone === "danger" && "text-destructive", tone === "success" && "text-emerald-500")}>{value}</span>
    </div>
  );
}

// ─── Dialogs ──────────────────────────────────────────────────────────────────

function PaymentDialog({ t, isOpen, isPending, onClose, onConfirm }: { t: DashboardTranslate; isOpen: boolean; isPending: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <FlowDialog title={t("createRequest.paymentDialog.title")} closeLabel={t("createRequest.actions.closeDialog")} isOpen={isOpen} onClose={onClose} footer={
      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="button" variant="outline" className="h-12 rounded-lg border-border bg-card text-sm font-semibold shadow-none" disabled={isPending} onClick={onClose}>{t("createRequest.actions.cancelPayment")}</Button>
        <Button type="button" className="h-12 rounded-lg text-sm font-semibold" disabled={isPending} onClick={onConfirm}>{isPending ? t("createRequest.actions.submitting") : t("createRequest.actions.confirm")}</Button>
      </div>
    }>
      <p className="text-sm font-bold text-foreground">{t("createRequest.paymentDialog.reviewTitle")}</p>
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-muted/20">
        <PaymentRow label={t("createRequest.paymentDialog.currentBalance")} value={t("createRequest.paymentDialog.currentBalanceValue")} />
        <PaymentRow label={t("createRequest.paymentDialog.amountToHold")} value={t("createRequest.paymentDialog.amountToHoldValue")} tone="danger" />
        <PaymentRow label={t("createRequest.paymentDialog.remainingBalance")} value={t("createRequest.paymentDialog.remainingBalanceValue")} tone="success" />
      </div>
      <div className="mt-4 rounded-lg border border-emerald-500 bg-emerald-500/10 p-4">
        <h3 className="font-bold text-foreground">{t("createRequest.paymentDialog.howItWorks.title")}</h3>
        <ol className="mt-2 list-decimal space-y-1 ps-5 text-xs font-medium leading-5 text-muted-foreground">
          <li>{t("createRequest.paymentDialog.howItWorks.hold")}</li>
          <li>{t("createRequest.paymentDialog.howItWorks.completed")}</li>
          <li>{t("createRequest.paymentDialog.howItWorks.refund")}</li>
        </ol>
      </div>
    </FlowDialog>
  );
}

function LocationDialog({ t, isOpen, initialValues, onClose, onSave }: {
  t: DashboardTranslate; isOpen: boolean;
  initialValues: LocationFormValues;
  onClose: () => void; onSave: (values: typeof initialValues) => void;
}) {
  const [activeTab, setActiveTab] = useState<"map" | "manual">("manual");
  const [locationValues, setLocationValues] = useState(initialValues);
  function updateField(key: keyof typeof initialValues, val: string) { setLocationValues((prev) => ({ ...prev, [key]: val })); }
  return (
    <FlowDialog title={t("createRequest.locationDialog.title")} closeLabel={t("createRequest.actions.closeDialog")} isOpen={isOpen} onClose={onClose} footer={<Button type="button" className="h-12 w-full rounded-lg text-sm font-semibold" onClick={() => onSave(locationValues)}>{t("createRequest.actions.save")}</Button>}>
      <div className="mb-4 flex gap-6 border-b border-border">
        {(["map", "manual"] as const).map((tab) => (
          <button key={tab} type="button" className={cn("pb-3 text-sm font-semibold", activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground")} onClick={() => setActiveTab(tab)}>{t(`createRequest.locationDialog.tabs.${tab}`)}</button>
        ))}
      </div>
      {activeTab === "map" ? (
        <div className="space-y-4">
          <LocationMap
            latitude={locationValues.latitude}
            longitude={locationValues.longitude}
            label={t("createRequest.locationDialog.mapLabel")}
            hint={t("createRequest.locationDialog.mapHint")}
            onSelect={(latitude, longitude) => setLocationValues((prev) => ({ ...prev, latitude, longitude }))}
          />
          <DialogInput label={t("createRequest.locationDialog.fields.storeName.label")} placeholder={t("createRequest.locationDialog.fields.storeName.placeholder")} value={locationValues.storeName} onChange={(v) => updateField("storeName", v)} />
          <DialogInput label={t("createRequest.locationDialog.fields.streetAddress.label")} placeholder={t("createRequest.locationDialog.fields.streetAddress.placeholder")} value={locationValues.streetAddress} onChange={(v) => updateField("streetAddress", v)} />
        </div>
      ) : (
        <div className="grid gap-4">
          <DialogInput label={t("createRequest.locationDialog.fields.storeName.label")} placeholder={t("createRequest.locationDialog.fields.storeName.placeholder")} value={locationValues.storeName} onChange={(v) => updateField("storeName", v)} />
          <DialogInput label={t("createRequest.locationDialog.fields.streetAddress.label")} placeholder={t("createRequest.locationDialog.fields.streetAddress.placeholder")} value={locationValues.streetAddress} onChange={(v) => updateField("streetAddress", v)} />
        </div>
      )}
    </FlowDialog>
  );
}

function LocationMap({ latitude, longitude, label, hint, onSelect }: {
  latitude: number;
  longitude: number;
  label: string;
  hint: string;
  onSelect: (latitude: number, longitude: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    let disposed = false;
    let map: import("leaflet").Map | undefined;

    async function initializeMap() {
      if (!containerRef.current) return;
      const leaflet = await import("leaflet");
      if (disposed || !containerRef.current) return;

      const hasSelection = latitude !== 0 || longitude !== 0;
      const initialPosition: import("leaflet").LatLngExpression = hasSelection
        ? [latitude, longitude]
        : [23.8859, 45.0792];
      map = leaflet.map(containerRef.current, {
        center: initialPosition,
        zoom: hasSelection ? 13 : 5,
        zoomControl: true,
      });
      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const markerStyle = {
        radius: 9,
        color: "var(--background)",
        weight: 3,
        fillColor: "var(--primary)",
        fillOpacity: 1,
      };
      let marker: import("leaflet").CircleMarker | null = hasSelection
        ? leaflet.circleMarker(initialPosition, markerStyle).addTo(map)
        : null;
      map.on("click", ({ latlng }: import("leaflet").LeafletMouseEvent) => {
        marker?.remove();
        marker = leaflet.circleMarker(latlng, markerStyle).addTo(map!);
        onSelectRef.current(
          Math.round(latlng.lat * 1_000_000) / 1_000_000,
          Math.round(latlng.lng * 1_000_000) / 1_000_000,
        );
      });

      window.requestAnimationFrame(() => map?.invalidateSize());
    }

    void initializeMap();
    return () => {
      disposed = true;
      map?.remove();
    };
  }, [latitude, longitude]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-border">
      <div ref={containerRef} className="h-72 w-full" role="application" aria-label={label} />
      <span className="pointer-events-none absolute bottom-3 start-3 z-[500] rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
        {hint}
      </span>
    </div>
  );
}

function DialogInput({ label, placeholder, value, className, onChange }: { label: string; placeholder: string; value: string; className?: string; onChange: (v: string) => void }) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-sm font-bold text-foreground">{label}<RequiredMark /></span>
      <Input className="h-11 rounded-lg" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function DateDialog({ t, isOpen, onClose, onSelect }: { t: DashboardTranslate; isOpen: boolean; onClose: () => void; onSelect: (display: string, iso: string) => void }) {
  const locale = useLocale();
  const [visibleDate, setVisibleDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const year = visibleDate.getFullYear(), month = visibleDate.getMonth();
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(visibleDate);
  const firstDay = new Date(year, month, 1).getDay(), daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = (firstDay + 6) % 7;
  const calendarDays = [...Array.from({ length: leadingDays }, (_, i) => ({ date: new Date(year, month, i - leadingDays + 1), isCurrentMonth: false })), ...Array.from({ length: daysInMonth }, (_, i) => ({ date: new Date(year, month, i + 1), isCurrentMonth: true }))];
  const trailing = (7 - (calendarDays.length % 7)) % 7;
  const fullDays = [...calendarDays, ...Array.from({ length: trailing }, (_, i) => ({ date: new Date(year, month + 1, i + 1), isCurrentMonth: false }))];
  function moveMonth(dir: -1 | 1) { setVisibleDate((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1)); }
  function selectDate(date: Date) {
    setSelectedDate(date);
    const display = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "long", year: "numeric" }).format(date);
    const iso = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
    onSelect(display, iso);
  }
  return (
    <FlowDialog title={t("createRequest.dateDialog.title")} closeLabel={t("createRequest.actions.closeDialog")} isOpen={isOpen} onClose={onClose} className="max-w-xl">
      <div className="rounded-lg border border-border p-8">
        <div className="flex items-center justify-between">
          <button type="button" className="flex items-center gap-3 text-start" aria-label={t("createRequest.dateDialog.changeMonthYear")} onClick={() => setIsYearPickerOpen((v) => !v)}>
            <h3 className="text-3xl font-bold text-foreground">{monthLabel}</h3>
            <SidebarChevronIcon className="size-5 text-primary" />
          </button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon-sm" className="rounded-full text-primary" aria-label={t("createRequest.dateDialog.previousMonth")} onClick={() => moveMonth(-1)}><PaginationPreviousIcon className="size-5 rtl:rotate-180" /></Button>
            <Button type="button" variant="ghost" size="icon-sm" className="rounded-full text-primary" aria-label={t("createRequest.dateDialog.nextMonth")} onClick={() => moveMonth(1)}><PaginationNextIcon className="size-5 rtl:rotate-180" /></Button>
          </div>
        </div>
        {isYearPickerOpen ? (
          <div className="mt-5 grid grid-cols-4 gap-2 rounded-lg bg-muted/40 p-3">
            {Array.from({ length: 8 }, (_, i) => year - 3 + i).map((yr) => (
              <button key={yr} type="button" className={cn("rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-primary/10 hover:text-primary", yr === year && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground")} onClick={() => { setVisibleDate(new Date(yr, month, 1)); setIsYearPickerOpen(false); }}>{yr}</button>
            ))}
          </div>
        ) : null}
        <div className="mt-8 grid grid-cols-7 gap-5 text-center">
          {(["mon","tue","wed","thu","fri","sat","sun"] as const).map((d) => (<span key={d} className="text-base font-medium text-muted-foreground">{t(`createRequest.dateDialog.days.${d}`)}</span>))}
          {fullDays.map(({ date, isCurrentMonth }) => {
            const isSel = selectedDate?.toDateString() === date.toDateString();
            return (
              <button key={date.toISOString()} type="button" className={cn("rounded-lg py-1 text-2xl font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-foreground", isCurrentMonth && "text-foreground", isSel && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground")} onClick={() => selectDate(date)}>{date.getDate()}</button>
            );
          })}
        </div>
      </div>
    </FlowDialog>
  );
}

interface TimeParts { hour: number; minute: number; period: "AM" | "PM" }
function formatTimeValue(value: string) { const [h = "0", m = "0"] = value.split(":"); const hour = Number(h); const minute = Number(m); const period = hour >= 12 ? "PM" : "AM"; const displayHour = hour % 12 || 12; return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`; }
function parseDisplayTime(value: string) { const match = value.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i); if (!match) return ""; const [, hText, mText, pText] = match; const h = Number(hText); const normalized = pText.toUpperCase() === "PM" ? (h === 12 ? 12 : h + 12) : h === 12 ? 0 : h; return `${String(normalized).padStart(2, "0")}:${mText}`; }
function getTimePartsFromInput(value: string): TimeParts { const [h = "9", m = "0"] = value.split(":"); const h24 = Number(h); const minute = Number(m); return { hour: h24 % 12 || 12, minute: Number.isNaN(minute) ? 0 : minute, period: h24 >= 12 ? "PM" : "AM" }; }
function getInputFromTimeParts({ hour, minute, period }: TimeParts) { const h24 = period === "PM" ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour; return `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`; }
function getHourRotation({ hour, minute }: TimeParts) { return ((hour % 12) + minute / 60) * 30; }
function getMinuteRotation({ minute }: TimeParts) { return minute * 6; }
function getTimePartsFromClockPointer(el: HTMLElement, clientX: number, clientY: number, parts: TimeParts, hand: "hour" | "minute"): TimeParts { const rect = el.getBoundingClientRect(); const angle = (Math.atan2(clientY - (rect.top + rect.height / 2), clientX - (rect.left + rect.width / 2)) * 180) / Math.PI; const normalized = (angle + 90 + 360) % 360; if (hand === "hour") return { ...parts, hour: Math.round(normalized / 30) || 12 }; return { ...parts, minute: Math.round(normalized / 6) % 60 }; }

function TimeDialog({ t, isOpen, onClose, value, onSelect }: { t: DashboardTranslate; isOpen: boolean; onClose: () => void; value: string; onSelect: (time: string) => void }) {
  const initialInputValue = parseDisplayTime(value) || "09:00";
  const [timeParts, setTimeParts] = useState(() => getTimePartsFromInput(initialInputValue));
  const [activeClockStep, setActiveClockStep] = useState<"hour" | "minute" | "period">("hour");
  const { isExiting, isMounted } = useDialogPresence(isOpen);
  function updateTimeParts(next: TimeParts) { setTimeParts(next); onSelect(formatTimeValue(getInputFromTimeParts(next))); }
  function updatePeriod(period: TimeParts["period"]) { updateTimeParts({ ...timeParts, period }); onClose(); }
  function updateTimeFromClock(e: React.PointerEvent<HTMLDivElement>) { if (activeClockStep === "period") return; updateTimeParts(getTimePartsFromClockPointer(e.currentTarget, e.clientX, e.clientY, timeParts, activeClockStep)); }
  function completeClockStep() { if (activeClockStep === "hour") { setActiveClockStep("minute"); return; } if (activeClockStep === "minute") { setActiveClockStep("period"); } }
  if (!isMounted) return null;
  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-[1px]", isExiting ? "dialog-overlay-out" : "dialog-overlay-in")} role="presentation" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={t("createRequest.timeDialog.title")} className={isExiting ? "clock-overlay-out" : "clock-overlay-pop"} onClick={(e) => e.stopPropagation()}>
        <div role="group" className="relative block aspect-square w-[min(82vw,20rem)] cursor-pointer touch-none overflow-hidden rounded-full border border-primary/30 bg-card/95 shadow-2xl ring-8 ring-primary/10 backdrop-blur" aria-label={t("createRequest.timeDialog.clockFace")} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); updateTimeFromClock(e); }} onPointerMove={(e) => { if (e.buttons === 1) updateTimeFromClock(e); }} onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); completeClockStep(); }}>
          <AnalogClockFace hourRotation={getHourRotation(timeParts)} minuteRotation={getMinuteRotation(timeParts)} showHands={activeClockStep !== "period"} />
          {activeClockStep === "period" ? (
            <div className="clock-period-switch absolute start-1/2 top-1/2 z-30 grid w-36 -translate-x-1/2 -translate-y-1/2 grid-cols-2 rounded-full bg-background/90 p-1 shadow-lg ring-1 ring-border/70 backdrop-blur" aria-label={t("createRequest.timeDialog.period")}>
              {(["AM", "PM"] as const).map((period) => (
                <button key={period} type="button" className={cn("cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition", timeParts.period === period ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-primary/10 hover:text-foreground")} onPointerDown={(e) => e.stopPropagation()} onPointerMove={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); updatePeriod(period); }}>{period === "AM" ? t("createRequest.timeDialog.am") : t("createRequest.timeDialog.pm")}</button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
