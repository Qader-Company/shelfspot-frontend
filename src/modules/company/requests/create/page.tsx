"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { useCreateTaskMutation } from "@/modules/company/requests/create/use-create-mutation";
import { useServicesQuery } from "@/modules/company/requests/create/use-query";
import { useProductsQuery } from "@/modules/company/catalog/products/use-query";
import { useBrandsQuery } from "@/modules/company/catalog/brands/use-query";
import { useSubBrandsQuery } from "@/modules/company/catalog/sub-brands/use-query";
import { useCategoriesQuery } from "@/modules/company/catalog/categories/hooks";
import { useSubCategoriesQuery } from "@/modules/company/catalog/sub-categories/hooks";
import type { CompanyService } from "@/modules/company/requests/create/types";
import type { CompanyProduct, GetProductsParams } from "@/modules/company/catalog/products/types";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { useDialogPresence } from "@/shared/hooks/use-dialog-presence";

import { createRequestSteps } from "@/modules/company/requests/create/seed";
import { CreateRequestLayout } from "@/modules/company/requests/create/layout";
import { CreateRequestStepper } from "@/modules/company/requests/create/stepper";
import { FlowDialog } from "@/modules/company/requests/create/flow-dialog";
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
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";

type DashboardTranslate = ReturnType<typeof useTranslations<"dashboard">>;
type DialogName =
  | "date"
  | "time"
  | "location"
  | "products"
  | "payment"
  | "success"
  | null;

function createRequestSchema(t: DashboardTranslate, selectedService: CompanyService | null) {
  return z.object({
    executionDate: z.string().min(1, t("createRequest.validation.executionDateRequired")),
    executionDateIso: z.string().min(1, t("createRequest.validation.executionDateRequired")),
    executionTime: z.string().min(1, t("createRequest.validation.executionTimeRequired")),
    storeName: z.string().min(1, t("createRequest.validation.storeRequired")),
    streetAddress: z.string().min(1, t("createRequest.validation.streetAddressRequired")),
    state: z.string().min(1, t("createRequest.validation.stateRequired")),
    region: z.string().min(1, t("createRequest.validation.regionRequired")),
    city: z.string().min(1, t("createRequest.validation.cityRequired")),
    district: z.string().optional(),
    latitude: z.number({ error: t("createRequest.validation.storeRequired") }).min(-90).max(90),
    longitude: z.number({ error: t("createRequest.validation.storeRequired") }).min(-180).max(180),
    serviceKey: z.string().min(1, t("createRequest.validation.serviceTypeRequired")),
    price: z
      .number({ error: t("createRequest.validation.priceRequired") })
      .min(
        selectedService?.minimum_price ?? 0,
        t("createRequest.validation.priceRequired"),
      ),
    executionTimeMins: z
      .number({ error: t("createRequest.validation.executionTimeMinsRequired") })
      .int()
      .min(
        selectedService?.minimum_execution_time ?? 0,
        t("createRequest.validation.executionTimeMinsRequired"),
      ),
    brand: z.string().optional(),
    subBrand: z.string().optional(),
    category: z.string().optional(),
    subCategory: z.string().optional(),
    search: z.string().optional(),
    productIds: z.array(z.number()).min(1, t("createRequest.validation.productsRequired")),
    instructions: z.string().min(10, t("createRequest.validation.instructionsRequired")),
    planogramFiles: z.array(z.instanceof(File)).optional(),
    jobOrderFiles: z.array(z.instanceof(File)).optional(),
  });
}

type CreateRequestFormValues = z.infer<ReturnType<typeof createRequestSchema>>;
type LocationFormValues = Pick<
  CreateRequestFormValues,
  "storeName" | "streetAddress" | "state" | "region" | "city" | "district" | "latitude" | "longitude"
>;

const defaultValues: CreateRequestFormValues = {
  executionDate: "",
  executionDateIso: "",
  executionTime: "",
  storeName: "",
  streetAddress: "",
  state: "",
  region: "",
  city: "",
  district: "",
  latitude: 0,
  longitude: 0,
  serviceKey: "",
  price: 0,
  executionTimeMins: 0,
  brand: "",
  subBrand: "",
  category: "",
  subCategory: "",
  search: "",
  productIds: [],
  instructions: "",
  planogramFiles: [],
  jobOrderFiles: [],
};

export function CreateRequestPage() {
  const t = useTranslations("dashboard");
  const [openDialog, setOpenDialog] = useState<DialogName>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isLocationExpanded, setIsLocationExpanded] = useState(true);
  const [isServiceExpanded, setIsServiceExpanded] = useState(true);
  const [isGuidelinesExpanded, setIsGuidelinesExpanded] = useState(true);
  const [productPage, setProductPage] = useState(1);
  // Per-product detail values keyed by product id: { [productId]: { [fieldKey]: value } }
  const [productDetails, setProductDetails] = useState<Record<number, Record<string, string>>>({});

  const locationSectionRef = useRef<HTMLElement | null>(null);
  const serviceSectionRef = useRef<HTMLElement | null>(null);
  const guidelinesSectionRef = useRef<HTMLElement | null>(null);

  const createTaskMutation = useCreateTaskMutation();
  const servicesQuery = useServicesQuery();

  const [selectedService, setSelectedService] = useState<CompanyService | null>(null);

  const schema = useMemo(
    () => createRequestSchema(t, selectedService),
    [t, selectedService],
  );

  const form = useForm<CreateRequestFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  const values = useWatch({ control: form.control });
  const hasLocation = Boolean(values.storeName);
  const selectedProductIds = (values.productIds ?? []) as number[];

  const productFilters: GetProductsParams = useMemo(() => ({
    brand_id: values.brand || undefined,
    sub_brand_id: values.subBrand || undefined,
    category_id: values.category || undefined,
    sub_category_id: values.subCategory || undefined,
    search: values.search || undefined,
    page: productPage,
  }), [values.brand, values.subBrand, values.category, values.subCategory, values.search, productPage]);

  const productsQuery = useProductsQuery(productFilters, {
    enabled: Boolean(values.subCategory),
  });

  // Dedicated queries for each level — mirrors the catalog ProductPage approach.
  // Each level is only fetched once its parent is selected.
  const brandsQuery = useBrandsQuery({ per_page: 100, page: 1 });

  const subBrandsQuery = useSubBrandsQuery({
    per_page: 100,
    page: 1,
    brand_id: values.brand || undefined,
  });

  const categoriesQuery = useCategoriesQuery({
    per_page: 100,
    page: 1,
    brand_id: values.brand || undefined,
    sub_brand_id: values.subBrand || undefined,
  });

  const subCategoriesQuery = useSubCategoriesQuery({
    per_page: 100,
    page: 1,
    brand_id: values.brand || undefined,
    sub_brand_id: values.subBrand || undefined,
    category_id: values.category || undefined,
  });

  const brandOptions = brandsQuery.data?.data ?? [];
  const subBrandOptions = values.brand ? (subBrandsQuery.data?.data ?? []) : [];
  const categoryOptions = values.subBrand ? (categoriesQuery.data?.data ?? []) : [];
  const subCategoryOptions = values.category ? (subCategoriesQuery.data?.data ?? []) : [];

  const products = productsQuery.data?.data ?? [];
  const productsMeta = productsQuery.data?.meta;

  // Derive the single extra column driven by the selected service's product_details_form.
  // Checks root-level first, then request_form-level.
  // Root-level empty array [] means no fields.
  const extraColumn: { key: string; type: string } | null = useMemo(() => {
    if (!selectedService) return null;
    // 1. Root-level (skip if empty array)
    const rootForm = selectedService.product_details_form;
    const rootFields = !Array.isArray(rootForm) && rootForm && typeof rootForm === "object"
      ? rootForm.fields
      : null;
    // 2. Inside request_form
    const nestedFields = selectedService.request_form?.product_details_form?.fields ?? null;
    const fields = rootFields ?? nestedFields;
    if (!fields) return null;
    const entry = Object.entries(fields)[0];
    if (!entry) return null;
    return { key: entry[0], type: entry[1].type };
  }, [selectedService]);

  // Derive which file upload fields to show from request_form.fields.
  // attachment_type drives which form field name to use:
  //   "planogram"  → planogramFiles
  //   "job_order"  → jobOrderFiles
  const showPlanogramUpload = useMemo(
    () => Object.values(selectedService?.request_form?.fields ?? {}).some((f) => f.attachment_type === "planogram"),
    [selectedService],
  );
  const showJobOrderUpload = useMemo(
    () => Object.values(selectedService?.request_form?.fields ?? {}).some((f) => f.attachment_type === "job_order"),
    [selectedService],
  );

  const sectionRefs = useMemo(() => [locationSectionRef, serviceSectionRef, guidelinesSectionRef], []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = Number((visible.target as HTMLElement).dataset.stepIndex);
        if (!Number.isNaN(idx)) setActiveStepIndex(idx);
      },
      { root: null, rootMargin: "-20% 0px -55% 0px", threshold: [0.2, 0.4, 0.6, 0.8] },
    );
    sectionRefs.forEach((r) => { if (r.current) observer.observe(r.current); });
    return () => observer.disconnect();
  }, [sectionRefs]);

  // Reset product page when filters change is handled in each filter onChange via setProductPage(1)
  function resetRequest() {
    form.reset(defaultValues);
    createTaskMutation.reset();
    setSelectedService(null);
    setProductPage(1);
    setProductDetails({});
    setIsLocationExpanded(true);
    setIsServiceExpanded(true);
    setIsGuidelinesExpanded(true);
  }

  function goToStep(index: number) {
    setActiveStepIndex(index);
    if (index === 0) setIsLocationExpanded(true);
    if (index === 1) setIsServiceExpanded(true);
    if (index === 2) setIsGuidelinesExpanded(true);
    window.requestAnimationFrame(() => {
      sectionRefs[index]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function saveLocation(locationValues: LocationFormValues) {
    Object.entries(locationValues).forEach(([key, val]) => {
      form.setValue(
        key as keyof LocationFormValues,
        val as string & number,
        { shouldDirty: true, shouldValidate: true },
      );
    });
    setOpenDialog(null);
  }

  function handleServiceChange(serviceKey: string) {
    const svc = servicesQuery.data?.data.find((s) => s.key === serviceKey) ?? null;
    setSelectedService(svc);
    form.setValue("serviceKey", serviceKey, { shouldDirty: true, shouldValidate: true });
    // clear products and their details when service changes
    form.setValue("productIds", [], { shouldDirty: true });
    setProductDetails({});
  }

  function toggleProduct(productId: number) {
    const current = form.getValues("productIds") as number[];
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    form.setValue("productIds", next, { shouldDirty: true, shouldValidate: true });
  }

  function submitForPayment() {
    setOpenDialog("payment");
  }

  async function confirmPayment() {
    const vals = form.getValues();
    try {
      await createTaskMutation.mutateAsync({
        companySlug: "",
        payload: {
          date: vals.executionDateIso,
          location: {
            latitude: vals.latitude,
            longitude: vals.longitude,
            location_name: vals.storeName || null,
            address: vals.streetAddress || null,
          },
          notes: vals.instructions || null,
          services: [
            {
              service_key: vals.serviceKey,
              price: vals.price,
              execution_time_minutes: vals.executionTimeMins,
              execution_instructions: vals.instructions || null,
              products: (vals.productIds as number[]).map((id) => ({
                product_id: id,
                product_details: productDetails[id] ?? {},
              })),
              planogramFiles: vals.planogramFiles ?? [],
              jobOrderFiles: vals.jobOrderFiles ?? [],
            },
          ],
        },
      });
      setOpenDialog("success");
    } catch (error) {
      const apiError = normalizeApiError(error);
      const message =
        apiError.status === 401 ? t("createRequest.errors.unauthorized")
        : apiError.status === 403 ? t("createRequest.errors.forbidden")
        : apiError.status === 422 ? apiError.message
        : t("createRequest.errors.generic");
      form.setError("root", { message });
      setOpenDialog(null);
    }
  }

  const services = servicesQuery.data?.data ?? [];
  const totalPrice = selectedService ? values.price ?? 0 : 0;

  return (
    <>
      <CreateRequestLayout
        title={t("createRequest.title")}
        subtitle={t("createRequest.subtitle")}
        stepper={
          <CreateRequestStepper
            steps={createRequestSteps}
            activeStepIndex={activeStepIndex}
            resolveLabel={(key) => t(key)}
            onStepClick={goToStep}
          />
        }
        navigation={
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-lg border-border bg-card px-8 text-sm font-semibold shadow-none"
              onClick={resetRequest}
            >
              {t("createRequest.actions.cancel")}
            </Button>
            <Button
              type="button"
              className="h-12 rounded-lg px-8 text-sm font-semibold text-primary-foreground hover:text-primary-foreground"
              onClick={form.handleSubmit(submitForPayment)}
            >
              {t("createRequest.actions.submit")}
            </Button>
          </div>
        }
      >
        <Form {...form}>
          <form className="space-y-5" noValidate>
            {form.formState.errors.root?.message ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            ) : null}

            {/* ── Location section ── */}
            <SectionCard
              sectionRef={locationSectionRef}
              stepIndex={0}
              title={t("createRequest.location.title")}
              description={t("createRequest.location.description")}
              isExpanded={isLocationExpanded}
              toggleLabel={t("createRequest.actions.toggleSection")}
              onToggle={() => setIsLocationExpanded((c) => !c)}
            >
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {t("createRequest.location.executionDateTime")}
                    <RequiredMark />
                  </h3>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <PickerField
                      label={t("createRequest.fields.executionDate.label")}
                      icon="calendar"
                      value={values.executionDate || t("createRequest.fields.executionDate.placeholder")}
                      onClick={() => setOpenDialog("date")}
                    />
                    <PickerField
                      label={t("createRequest.fields.executionTime.label")}
                      icon="clock"
                      value={values.executionTime || t("createRequest.fields.executionTime.placeholder")}
                      onClick={() => setOpenDialog("time")}
                    />
                  </div>
                  <div className="grid gap-1 md:grid-cols-2">
                    <HiddenFieldMessage name="executionDate" />
                    <HiddenFieldMessage name="executionTime" />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-primary">
                    {t("createRequest.location.scheduleHint")}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {t("createRequest.location.storeLocation")}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    {t("createRequest.location.storeDescription")}
                  </p>
                  <button
                    type="button"
                    className="mt-4 flex w-full items-center gap-4 rounded-xl border border-primary bg-background p-4 text-start transition hover:bg-primary/5"
                    onClick={() => setOpenDialog("location")}
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MapPinIcon className="size-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-foreground">
                        {hasLocation ? values.storeName : t("createRequest.location.addLocation")}
                      </span>
                      <span className="mt-1 block text-xs font-medium leading-5 text-muted-foreground">
                        {hasLocation ? values.streetAddress : t("createRequest.location.addLocationDescription")}
                      </span>
                    </span>
                  </button>
                  <HiddenFieldMessage name="storeName" />
                </div>
              </div>
            </SectionCard>

            {/* ── Services section ── */}
            <SectionCard
              sectionRef={serviceSectionRef}
              stepIndex={1}
              title={t("createRequest.services.title")}
              description={t("createRequest.services.description")}
              isExpanded={isServiceExpanded}
              toggleLabel={t("createRequest.actions.toggleSection")}
              onToggle={() => setIsServiceExpanded((c) => !c)}
            >
              <div className="space-y-4">
                {/* Service header bar */}
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-foreground">
                      {t("createRequest.services.serviceLabel", { index: 1 })}
                    </h3>
                    {selectedService ? (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500">
                        {values.price} SAR
                      </span>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    className="rounded-full bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                    aria-label={t("createRequest.actions.toggleSection")}
                    onClick={() => setIsServiceExpanded((c) => !c)}
                  >
                    <PaginationNextIcon className={cn("size-4 rotate-90 transition", isServiceExpanded && "-rotate-90")} />
                  </Button>
                </div>

                {/* Service form body */}
                {isServiceExpanded ? (
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          {t("createRequest.services.selectServiceTitle")}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                          {t("createRequest.services.selectServiceDescription")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      {/* Service type select — driven by real API */}
                      <FormField
                        control={form.control}
                        name="serviceKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-bold">
                              {t("createRequest.fields.serviceType.label")}
                            </FormLabel>
                            <FormControl>
                              <select
                                value={field.value}
                                disabled={servicesQuery.isPending}
                                className="h-12 w-full rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:opacity-50"
                                onChange={(e) => handleServiceChange(e.target.value)}
                              >
                                <option value="">
                                  {servicesQuery.isPending
                                    ? t("createRequest.states.loading")
                                    : t("createRequest.fields.serviceType.placeholder")}
                                </option>
                                {services.map((svc) => (
                                  <option key={svc.key} value={svc.key}>
                                    {svc.name}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Price and execution time — editable, validated against service minimum */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-bold">
                                {t("createRequest.fields.price.label")}
                                {selectedService ? (
                                  <span className="ms-2 text-xs font-normal text-muted-foreground">
                                    (min: {selectedService.minimum_price})
                                  </span>
                                ) : null}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={selectedService?.minimum_price ?? 0}
                                  placeholder={t("createRequest.fields.price.placeholder")}
                                  className="h-12 rounded-lg"
                                  disabled={!selectedService}
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="executionTimeMins"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-bold">
                                {t("createRequest.fields.estimatedTime.label")}
                                {selectedService ? (
                                  <span className="ms-2 text-xs font-normal text-muted-foreground">
                                    (min: {selectedService.minimum_execution_time})
                                  </span>
                                ) : null}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={selectedService?.minimum_execution_time ?? 0}
                                  placeholder="60"
                                  className="h-12 rounded-lg"
                                  disabled={!selectedService}
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Product filters */}
                      <div className="grid gap-4 lg:grid-cols-4">
                        <FormField
                          control={form.control}
                          name="brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-bold">
                                {t("createRequest.fields.brand.label")}
                              </FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  className="h-12 w-full rounded-lg border border-border bg-card px-3 text-sm"
                                  onChange={(event) => {
                                    field.onChange(event);
                                    form.setValue("subBrand", "");
                                    form.setValue("category", "");
                                    form.setValue("subCategory", "");
                                    form.setValue("productIds", []);
                                    setProductPage(1);
                                  }}
                                >
                                  <option value="">{t("createRequest.fields.brand.placeholder")}</option>
                                  {brandOptions.map((option) => <option key={option.id} value={String(option.id)}>{option.name}</option>)}
                                </select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="subBrand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-bold">
                                {t("createRequest.fields.subBrand.label")}
                              </FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  disabled={!values.brand}
                                  className="h-12 w-full rounded-lg border border-border bg-card px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                                  onChange={(event) => {
                                    field.onChange(event);
                                    form.setValue("category", "");
                                    form.setValue("subCategory", "");
                                    form.setValue("productIds", []);
                                    setProductPage(1);
                                  }}
                                >
                                  <option value="">{t("createRequest.fields.subBrand.placeholder")}</option>
                                  {subBrandOptions.map((option) => <option key={option.id} value={String(option.id)}>{option.name}</option>)}
                                </select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-bold">
                                {t("createRequest.fields.category.label")}
                              </FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  disabled={!values.subBrand}
                                  className="h-12 w-full rounded-lg border border-border bg-card px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                                  onChange={(event) => {
                                    field.onChange(event);
                                    form.setValue("subCategory", "");
                                    form.setValue("productIds", []);
                                    setProductPage(1);
                                  }}
                                >
                                  <option value="">{t("createRequest.fields.category.placeholder")}</option>
                                  {categoryOptions.map((option) => <option key={option.id} value={String(option.id)}>{option.name}</option>)}
                                </select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="subCategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-bold">
                                {t("createRequest.fields.subCategory.label")}
                              </FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  disabled={!values.category}
                                  className="h-12 w-full rounded-lg border border-border bg-card px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                                  onChange={(event) => {
                                    field.onChange(event);
                                    form.setValue("productIds", []);
                                    setProductPage(1);
                                  }}
                                >
                                  <option value="">{t("createRequest.fields.subCategory.placeholder")}</option>
                                  {subCategoryOptions.map((option) => <option key={option.id} value={String(option.id)}>{option.name}</option>)}
                                </select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Product table */}
                      <ProductTable
                        t={t}
                        products={products}
                        isLoading={productsQuery.isPending}
                        isError={productsQuery.isError}
                        selectedProductIds={selectedProductIds}
                        extraColumn={extraColumn}
                        productDetails={productDetails}
                        onDetailChange={(productId, fieldKey, value) => {
                          setProductDetails((prev) => ({
                            ...prev,
                            [productId]: { ...(prev[productId] ?? {}), [fieldKey]: value },
                          }));
                        }}
                        meta={productsMeta}
                        page={productPage}
                        onPageChange={setProductPage}
                        onToggle={toggleProduct}
                        onShowProducts={() => setOpenDialog("products")}
                        control={form.control}
                      />
                      <HiddenFieldMessage name="productIds" />
                    </div>
                  </div>
                ) : null}

                {/* Total cost */}
                {selectedService ? (
                  <TotalCostCard
                    label={t("createRequest.cost.title")}
                    description={selectedService.name}
                    amount={`${totalPrice} SAR`}
                  />
                ) : null}
              </div>
            </SectionCard>

            {/* ── Guidelines section ── */}
            <SectionCard
              sectionRef={guidelinesSectionRef}
              stepIndex={2}
              title={t("createRequest.guidelines.title")}
              description={t("createRequest.guidelines.description")}
              isExpanded={isGuidelinesExpanded}
              toggleLabel={t("createRequest.actions.toggleSection")}
              onToggle={() => setIsGuidelinesExpanded((c) => !c)}
            >
              <GuidelinesFields
                t={t}
                control={form.control}
                showPlanogramUpload={showPlanogramUpload}
                showJobOrderUpload={showJobOrderUpload}
              />
            </SectionCard>
          </form>
        </Form>
      </CreateRequestLayout>

      {/* ── Dialogs ── */}
      {openDialog === "date" ? (
        <DateDialog
          t={t}
          isOpen
          onClose={() => setOpenDialog(null)}
          onSelect={(display, iso) => {
            form.setValue("executionDate", display, { shouldDirty: true, shouldValidate: true });
            form.setValue("executionDateIso", iso, { shouldDirty: true, shouldValidate: true });
            setOpenDialog(null);
          }}
        />
      ) : null}
      {openDialog === "time" ? (
        <TimeDialog
          t={t}
          isOpen
          onClose={() => setOpenDialog(null)}
          value={values.executionTime ?? ""}
          onSelect={(time) => {
            form.setValue("executionTime", time, { shouldDirty: true, shouldValidate: true });
          }}
        />
      ) : null}
      {openDialog === "location" ? (
        <LocationDialog
          t={t}
          isOpen
          initialValues={{
            storeName: values.storeName ?? "",
            streetAddress: values.streetAddress ?? "",
            state: values.state ?? "",
            region: values.region ?? "",
            city: values.city ?? "",
            district: values.district ?? "",
            latitude: values.latitude ?? 0,
            longitude: values.longitude ?? 0,
          }}
          onClose={() => setOpenDialog(null)}
          onSave={saveLocation}
        />
      ) : null}
      <ProductsDialog
        t={t}
        isOpen={openDialog === "products"}
        products={products}
        isLoading={productsQuery.isPending}
        selectedProductIds={selectedProductIds}
        onClose={() => setOpenDialog(null)}
        onConfirm={() => setOpenDialog(null)}
        onToggle={toggleProduct}
      />
      <PaymentDialog
        t={t}
        isOpen={openDialog === "payment"}
        isPending={createTaskMutation.isPending}
        onClose={() => setOpenDialog(null)}
        onConfirm={confirmPayment}
      />
      <FlowDialog
        title={t("createRequest.success.title")}
        closeLabel={t("createRequest.actions.closeDialog")}
        isOpen={openDialog === "success"}
        onClose={() => setOpenDialog(null)}
        footer={
          <Button
            type="button"
            className="h-11 w-full rounded-lg text-sm font-semibold"
            onClick={() => setOpenDialog(null)}
          >
            {t("createRequest.success.action")}
          </Button>
        }
      >
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircleIcon className="size-7" />
          </span>
          <p className="mt-4 text-sm font-medium leading-6 text-muted-foreground">
            {t("createRequest.success.description")}
          </p>
        </div>
      </FlowDialog>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionCard({
  sectionRef, stepIndex, title, description, action,
  isExpanded, toggleLabel, children, onToggle,
}: {
  sectionRef?: React.Ref<HTMLElement>;
  stepIndex?: number;
  title: string;
  description: string;
  action?: React.ReactNode;
  isExpanded: boolean;
  toggleLabel: string;
  children: React.ReactNode;
  onToggle: () => void;
}) {
  return (
    <section
      ref={sectionRef}
      data-step-index={stepIndex}
      className="scroll-mt-28 rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          {action}
          <Button
            type="button"
            size="icon-lg"
            variant="ghost"
            className="rounded-full bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
            aria-label={toggleLabel}
            onClick={onToggle}
          >
            <PaginationNextIcon className={cn("size-4 rotate-90 transition", isExpanded && "-rotate-90")} />
          </Button>
        </div>
      </div>
      {isExpanded ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

function ProductTable({
  t, products, isLoading, isError, selectedProductIds, extraColumn, productDetails,
  onDetailChange, meta, page, onPageChange, onToggle, onShowProducts, control,
}: {
  t: DashboardTranslate;
  products: CompanyProduct[];
  isLoading: boolean;
  isError: boolean;
  selectedProductIds: number[];
  extraColumn: { key: string; type: string } | null;
  productDetails: Record<number, Record<string, string>>;
  onDetailChange: (productId: number, fieldKey: string, value: string) => void;
  meta?: { current_page: number; last_page: number; per_page: number; total: number };
  page: number;
  onPageChange: (p: number) => void;
  onToggle: (id: number) => void;
  onShowProducts: () => void;
  control: import("react-hook-form").Control<CreateRequestFormValues>;
}) {
  const totalPages = meta?.last_page ?? 1;
  const [editingId, setEditingId] = useState<number | null>(null);

  const extraColumnLabel = extraColumn
    ? extraColumn.key === "minimum_quantity"
      ? t("createRequest.productTable.columns.minQuantity")
      : extraColumn.key === "expected_expiry_date"
        ? t("createRequest.productTable.columns.expiryDate")
        : extraColumn.key.replace(/_/g, " ")
    : null;
  // total visible columns: checkbox + products + sku + barcode + optional extra
  const totalCols = extraColumn ? 5 : 4;

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <FormField
          control={control}
          name="search"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  className="h-11 rounded-lg px-4 text-sm"
                  placeholder={t("createRequest.productTable.searchPlaceholder")}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm font-bold text-primary underline-offset-4 hover:underline"
          onClick={onShowProducts}
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
          {meta ? `${meta.total} ` : ""}{t("createRequest.productTable.showProducts")}
        </button>
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead className="bg-muted/30 text-xs font-semibold text-muted-foreground">
            <tr>
              <th className="w-12 border-b border-e border-border px-4 py-3 text-start">
                <input type="checkbox" className="size-4 accent-primary" readOnly />
              </th>
              <th className="border-b border-e border-border px-4 py-3 text-start">
                {t("createRequest.productTable.columns.products")}
              </th>
              <th className="border-b border-e border-border px-4 py-3 text-center">
                {t("createRequest.productTable.columns.sku")}
              </th>
              <th className={cn("border-b border-border px-4 py-3 text-center", extraColumn && "border-e")}>
                {t("createRequest.productTable.columns.barcode")}
              </th>
              {extraColumnLabel ? (
                <th className="border-b border-border px-4 py-3 text-center">
                  {extraColumnLabel}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={totalCols} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {t("createRequest.states.loading")}
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={totalCols} className="px-4 py-8 text-center text-sm text-destructive">
                  {t("createRequest.errors.loadProducts")}
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {t("createRequest.productTable.noProducts")}
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const isSelected = selectedProductIds.includes(product.id);
                const detailValue = productDetails[product.id]?.[extraColumn?.key ?? ""] ?? "";
                const isEditing = editingId === product.id;

                return (
                  <tr key={product.id} className="border-b border-border last:border-b-0">
                    {/* Checkbox */}
                    <td className="border-e border-border px-4 py-4">
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={isSelected}
                        onChange={() => onToggle(product.id)}
                      />
                    </td>
                    {/* Product name + thumbnail */}
                    <td className="border-e border-border px-4 py-4">
                      <div className="flex items-center gap-3">
                        <ProductThumbnail imageUrl={product.image_url} />
                        <span className="font-semibold text-foreground">{product.name}</span>
                      </div>
                    </td>
                    {/* SKU */}
                    <td className="border-e border-border px-4 py-4 text-center text-muted-foreground">
                      {product.sku}
                    </td>
                    {/* Barcode */}
                    <td className={cn("px-4 py-4 text-center text-muted-foreground", extraColumn && "border-e border-border")}>
                      {product.barcode ?? "—"}
                    </td>
                    {/* Extra column: value + pencil → click pencil → inline input */}
                    {extraColumn ? (
                      <td className="px-4 py-4 text-center">
                        {isEditing ? (
                          <input
                            autoFocus
                            type={extraColumn.type === "integer" ? "number" : "date"}
                            min={extraColumn.type === "integer" ? 1 : undefined}
                            value={detailValue}
                            onChange={(e) => onDetailChange(product.id, extraColumn.key, e.target.value)}
                            onBlur={() => setEditingId(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === "Escape") setEditingId(null);
                            }}
                            className="h-9 w-32 rounded-lg border border-primary bg-background px-3 text-center text-sm outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-medium text-foreground">
                              {detailValue || "—"}
                            </span>
                            <button
                              type="button"
                              aria-label={t("createRequest.productTable.editDetail")}
                              onClick={() => setEditingId(product.id)}
                              className="text-primary transition hover:text-primary/70"
                            >
                              <EditIcon className="size-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <PaginationPreviousIcon className="size-4 rtl:rotate-180" />
            {t("createRequest.pagination.previous")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            {t("createRequest.pagination.next")}
            <PaginationNextIcon className="size-4 rtl:rotate-180" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

// ─── Reusable file-upload field (planogram / job order) ──────────────────────

function ServiceFileUpload({
  t, control, name, label, accept, acceptLabel,
}: {
  t: DashboardTranslate;
  control: import("react-hook-form").Control<CreateRequestFormValues>;
  name: "planogramFiles" | "jobOrderFiles";
  label: string;
  accept: string;
  acceptLabel: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const files: File[] = (field.value as File[]) ?? [];

        function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
          const selected = Array.from(e.target.files ?? []);
          const merged = [...files, ...selected.filter((inc) => !files.some((ex) => ex.name === inc.name))];
          field.onChange(merged);
          e.target.value = "";
        }

        function remove(fileName: string) {
          field.onChange(files.filter((f) => f.name !== fileName));
        }

        return (
          <FormItem>
            <FormLabel className="text-base font-bold">{label}</FormLabel>
            <FormControl>
              <label className="mt-2 flex cursor-pointer flex-col items-center rounded-lg border border-dashed border-border px-5 py-6 text-center transition hover:border-primary/50 hover:bg-primary/5">
                <UploadIcon className="size-5 text-foreground" />
                <p className="mt-2 text-sm font-bold text-foreground">
                  {t("createRequest.guidelines.uploadTitle")}
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {t("createRequest.guidelines.uploadDescription")}
                </p>
                <p className="mt-1.5 text-xs font-semibold text-primary">{acceptLabel}</p>
                <input type="file" className="sr-only" multiple accept={accept} onChange={handleSelect} />
              </label>
            </FormControl>
            {files.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {files.map((file) => (
                  <li key={file.name} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-4 py-2">
                    <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                      aria-label={t("createRequest.guidelines.removeFile")}
                      onClick={() => remove(file.name)}
                    >
                      <CloseIcon className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </FormItem>
        );
      }}
    />
  );
}

function GuidelinesFields({
  t, control, showPlanogramUpload, showJobOrderUpload,
}: {
  t: DashboardTranslate;
  control: import("react-hook-form").Control<CreateRequestFormValues>;
  showPlanogramUpload: boolean;
  showJobOrderUpload: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Planogram upload */}
      {showPlanogramUpload ? (
        <ServiceFileUpload
          t={t}
          control={control}
          name="planogramFiles"
          label={t("createRequest.fields.planogramFiles.label")}
          accept="application/pdf,image/*"
          acceptLabel={t("createRequest.fields.planogramFiles.accept")}
        />
      ) : null}

      {/* Job order upload — secondary display only */}
      {showJobOrderUpload ? (
        <ServiceFileUpload
          t={t}
          control={control}
          name="jobOrderFiles"
          label={t("createRequest.fields.jobOrderFiles.label")}
          accept="application/pdf,image/*,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          acceptLabel={t("createRequest.fields.jobOrderFiles.accept")}
        />
      ) : null}

      {/* Instructions */}
      <FormField
        control={control}
        name="instructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-bold">
              {t("createRequest.fields.instructions.label")}
            </FormLabel>
            <FormDescription>
              {t("createRequest.fields.instructions.description")}
            </FormDescription>
            <FormControl>
              <textarea
                className="min-h-36 w-full rounded-lg border border-input bg-transparent px-4 py-3 text-sm font-medium leading-6 outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
                placeholder={t("createRequest.fields.instructions.placeholder")}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function ProductsDialog({
  t, isOpen, products, isLoading, selectedProductIds, onClose, onConfirm, onToggle,
}: {
  t: DashboardTranslate;
  isOpen: boolean;
  products: CompanyProduct[];
  isLoading: boolean;
  selectedProductIds: number[];
  onClose: () => void;
  onConfirm: () => void;
  onToggle: (id: number) => void;
}) {
  return (
    <FlowDialog
      title={t("createRequest.productsDialog.title")}
      closeLabel={t("createRequest.actions.closeDialog")}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <Button type="button" className="h-12 w-full rounded-lg text-sm font-semibold" onClick={onConfirm}>
          {t("createRequest.actions.confirm")}
        </Button>
      }
    >
      <p className="text-sm font-semibold text-muted-foreground">
        {t("createRequest.productsDialog.selectedCount", { count: selectedProductIds.length })}
      </p>
      <div className="mt-4 space-y-3">
        {isLoading ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t("createRequest.states.loading")}
          </p>
        ) : products.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t("createRequest.states.noProducts")}
          </p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={selectedProductIds.includes(product.id)}
                  onChange={() => onToggle(product.id)}
                />
                <ProductThumbnail imageUrl={product.image_url} />
                <div>
                  <p className="text-sm font-bold text-foreground">{product.name}</p>
                  <p className="text-xs font-medium text-muted-foreground">SKU: {product.sku}</p>
                </div>
              </div>
              <TrashIcon className="size-4 text-muted-foreground" />
            </div>
          ))
        )}
      </div>
    </FlowDialog>
  );
}

function PaymentDialog({
  t, isOpen, isPending, onClose, onConfirm,
}: {
  t: DashboardTranslate;
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <FlowDialog
      title={t("createRequest.paymentDialog.title")}
      closeLabel={t("createRequest.actions.closeDialog")}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-lg border-border bg-card text-sm font-semibold shadow-none"
            disabled={isPending}
            onClick={onClose}
          >
            {t("createRequest.actions.cancelPayment")}
          </Button>
          <Button
            type="button"
            className="h-12 rounded-lg text-sm font-semibold"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? t("createRequest.actions.submitting") : t("createRequest.actions.confirm")}
          </Button>
        </div>
      }
    >
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
      <div className="mt-4 rounded-lg border border-orange-400 bg-orange-400/10 p-4">
        <h3 className="font-bold text-foreground">{t("createRequest.paymentDialog.status.title")}</h3>
        <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">
          {t("createRequest.paymentDialog.status.description")}
        </p>
      </div>
    </FlowDialog>
  );
}

function LocationDialog({
  t, isOpen, initialValues, onClose, onSave,
}: {
  t: DashboardTranslate;
  isOpen: boolean;
  initialValues: LocationFormValues;
  onClose: () => void;
  onSave: (values: LocationFormValues) => void;
}) {
  const [activeTab, setActiveTab] = useState<"map" | "manual">("manual");
  const [locationValues, setLocationValues] = useState<LocationFormValues>(initialValues);
  const [pinPosition, setPinPosition] = useState({ x: 50, y: 50 });

  function updateField(key: keyof LocationFormValues, val: string) {
    setLocationValues((prev) => ({ ...prev, [key]: val }));
  }

  function selectMapPoint(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(92, Math.max(8, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(85, Math.max(15, ((e.clientY - rect.top) / rect.height) * 100));
    setPinPosition({ x, y });
    const lat = Math.round((32.2 - (y / 100) * (32.2 - 16.3)) * 10000) / 10000;
    const lng = Math.round((34.4 + (x / 100) * (55.7 - 34.4)) * 10000) / 10000;
    setLocationValues((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      storeName: prev.storeName || t("createRequest.mock.location.storeName"),
      streetAddress: prev.streetAddress || t("createRequest.mock.location.streetAddress"),
      state: prev.state || t("createRequest.mock.location.state"),
      region: prev.region || t("createRequest.mock.location.region"),
      city: prev.city || t("createRequest.mock.location.city"),
      district: prev.district || t("createRequest.mock.location.district"),
    }));
  }

  return (
    <FlowDialog
      title={t("createRequest.locationDialog.title")}
      closeLabel={t("createRequest.actions.closeDialog")}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <Button type="button" className="h-12 w-full rounded-lg text-sm font-semibold" onClick={() => onSave(locationValues)}>
          {t("createRequest.actions.save")}
        </Button>
      }
    >
      <div className="mb-4 flex gap-6 border-b border-border">
        {(["map", "manual"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={cn("pb-3 text-sm font-semibold", activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground")}
            onClick={() => setActiveTab(tab)}
          >
            {t(`createRequest.locationDialog.tabs.${tab}`)}
          </button>
        ))}
      </div>
      {activeTab === "map" ? (
        <div className="space-y-4">
          <button
            type="button"
            className="relative min-h-44 w-full overflow-hidden rounded-lg bg-muted text-start"
            aria-label={t("createRequest.locationDialog.mapLabel")}
            onClick={selectMapPoint}
          >
            <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,transparent_46%,hsl(var(--background))_46%,hsl(var(--background))_54%,transparent_54%),linear-gradient(0deg,transparent_0,transparent_42%,hsl(var(--background))_42%,hsl(var(--background))_50%,transparent_50%)] opacity-80" />
            <span
              className="absolute flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
              style={{ left: `${pinPosition.x}%`, top: `${pinPosition.y}%` }}
            >
              <MapPinIcon className="size-5" />
            </span>
            <span className="absolute bottom-3 start-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-muted-foreground">
              {t("createRequest.locationDialog.mapHint")}
            </span>
          </button>
          <DialogInput
            label={t("createRequest.locationDialog.fields.storeName.label")}
            placeholder={t("createRequest.locationDialog.fields.storeName.placeholder")}
            value={locationValues.storeName}
            onChange={(v) => updateField("storeName", v)}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <DialogInput className="md:col-span-2" label={t("createRequest.locationDialog.fields.storeName.label")} placeholder={t("createRequest.locationDialog.fields.storeName.placeholder")} value={locationValues.storeName} onChange={(v) => updateField("storeName", v)} />
          <DialogInput className="md:col-span-2" label={t("createRequest.locationDialog.fields.streetAddress.label")} placeholder={t("createRequest.locationDialog.fields.streetAddress.placeholder")} value={locationValues.streetAddress} onChange={(v) => updateField("streetAddress", v)} />
          <DialogInput label={t("createRequest.locationDialog.fields.state.label")} placeholder={t("createRequest.locationDialog.fields.state.placeholder")} value={locationValues.state} onChange={(v) => updateField("state", v)} />
          <DialogInput label={t("createRequest.locationDialog.fields.region.label")} placeholder={t("createRequest.locationDialog.fields.region.placeholder")} value={locationValues.region} onChange={(v) => updateField("region", v)} />
          <DialogInput label={t("createRequest.locationDialog.fields.city.label")} placeholder={t("createRequest.locationDialog.fields.city.placeholder")} value={locationValues.city} onChange={(v) => updateField("city", v)} />
          <DialogInput label={t("createRequest.locationDialog.fields.district.label")} placeholder={t("createRequest.locationDialog.fields.district.placeholder")} value={locationValues.district ?? ""} onChange={(v) => updateField("district", v)} />
        </div>
      )}
    </FlowDialog>
  );
}

function DateDialog({
  t, isOpen, onClose, onSelect,
}: {
  t: DashboardTranslate;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (display: string, iso: string) => void;
}) {
  const [visibleDate, setVisibleDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(visibleDate);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = (firstDay + 6) % 7;
  const calendarDays = [
    ...Array.from({ length: leadingDays }, (_, i) => ({ date: new Date(year, month, i - leadingDays + 1), isCurrentMonth: false })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ date: new Date(year, month, i + 1), isCurrentMonth: true })),
  ];
  const trailing = (7 - (calendarDays.length % 7)) % 7;
  const fullDays = [...calendarDays, ...Array.from({ length: trailing }, (_, i) => ({ date: new Date(year, month + 1, i + 1), isCurrentMonth: false }))];

  function moveMonth(dir: -1 | 1) {
    setVisibleDate((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1));
  }

  function selectDate(date: Date) {
    setSelectedDate(date);
    const display = new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "long", year: "numeric" }).format(date);
    const iso = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
    onSelect(display, iso);
  }

  return (
    <FlowDialog
      title={t("createRequest.dateDialog.title")}
      closeLabel={t("createRequest.actions.closeDialog")}
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-xl"
    >
      <div className="rounded-lg border border-border p-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-3 text-start"
            aria-label={t("createRequest.dateDialog.changeMonthYear")}
            onClick={() => setIsYearPickerOpen((v) => !v)}
          >
            <h3 className="text-3xl font-bold text-foreground">{monthLabel}</h3>
            <SidebarChevronIcon className="size-5 text-primary" />
          </button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon-sm" className="rounded-full text-primary" aria-label={t("createRequest.dateDialog.previousMonth")} onClick={() => moveMonth(-1)}>
              <PaginationPreviousIcon className="size-5 rtl:rotate-180" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" className="rounded-full text-primary" aria-label={t("createRequest.dateDialog.nextMonth")} onClick={() => moveMonth(1)}>
              <PaginationNextIcon className="size-5 rtl:rotate-180" />
            </Button>
          </div>
        </div>
        {isYearPickerOpen ? (
          <div className="mt-5 grid grid-cols-4 gap-2 rounded-lg bg-muted/40 p-3">
            {Array.from({ length: 8 }, (_, i) => year - 3 + i).map((yr) => (
              <button
                key={yr}
                type="button"
                className={cn("rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-primary/10 hover:text-primary", yr === year && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground")}
                onClick={() => { setVisibleDate(new Date(yr, month, 1)); setIsYearPickerOpen(false); }}
              >
                {yr}
              </button>
            ))}
          </div>
        ) : null}
        <div className="mt-8 grid grid-cols-7 gap-5 text-center">
          {(["mon","tue","wed","thu","fri","sat","sun"] as const).map((d) => (
            <span key={d} className="text-base font-medium text-muted-foreground">{t(`createRequest.dateDialog.days.${d}`)}</span>
          ))}
          {fullDays.map(({ date, isCurrentMonth }) => {
            const isSel = selectedDate?.toDateString() === date.toDateString();
            return (
              <button
                key={date.toISOString()}
                type="button"
                className={cn("rounded-lg py-1 text-2xl font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-foreground", isCurrentMonth && "text-foreground", isSel && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground")}
                onClick={() => selectDate(date)}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </FlowDialog>
  );
}

function TimeDialog({
  t, isOpen, onClose, value, onSelect,
}: {
  t: DashboardTranslate;
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onSelect: (time: string) => void;
}) {
  const initialInputValue = parseDisplayTime(value) || "09:00";
  const [timeParts, setTimeParts] = useState(() => getTimePartsFromInput(initialInputValue));
  const [activeClockStep, setActiveClockStep] = useState<"hour" | "minute" | "period">("hour");
  const { isExiting, isMounted } = useDialogPresence(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    setTimeParts(getTimePartsFromInput(parseDisplayTime(value) || "09:00"));
    setActiveClockStep("hour");
  }, [isOpen, value]);

  function updateTimeParts(next: TimeParts) {
    setTimeParts(next);
    onSelect(formatTimeValue(getInputFromTimeParts(next)));
  }

  function updatePeriod(period: TimeParts["period"]) {
    updateTimeParts({ ...timeParts, period });
    onClose();
  }

  function updateTimeFromClock(e: React.PointerEvent<HTMLDivElement>) {
    if (activeClockStep === "period") return;
    updateTimeParts(getTimePartsFromClockPointer(e.currentTarget, e.clientX, e.clientY, timeParts, activeClockStep));
  }

  function completeClockStep() {
    if (activeClockStep === "hour") { setActiveClockStep("minute"); return; }
    if (activeClockStep === "minute") { setActiveClockStep("period"); }
  }

  if (!isMounted) return null;

  return (
    <div
      className={cn("fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-[1px]", isExiting ? "dialog-overlay-out" : "dialog-overlay-in")}
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("createRequest.timeDialog.title")}
        className={isExiting ? "clock-overlay-out" : "clock-overlay-pop"}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          role="group"
          className="relative block aspect-square w-[min(82vw,20rem)] cursor-pointer touch-none overflow-hidden rounded-full border border-primary/30 bg-card/95 shadow-2xl ring-8 ring-primary/10 backdrop-blur"
          aria-label={t("createRequest.timeDialog.clockFace")}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); updateTimeFromClock(e); }}
          onPointerMove={(e) => { if (e.buttons === 1) updateTimeFromClock(e); }}
          onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); completeClockStep(); }}
        >
          <AnalogClockFace
            hourRotation={getHourRotation(timeParts)}
            minuteRotation={getMinuteRotation(timeParts)}
            showHands={activeClockStep !== "period"}
          />
          {activeClockStep === "period" ? (
            <div
              className="clock-period-switch absolute start-1/2 top-1/2 z-30 grid w-36 -translate-x-1/2 -translate-y-1/2 grid-cols-2 rounded-full bg-background/90 p-1 shadow-lg ring-1 ring-border/70 backdrop-blur"
              aria-label={t("createRequest.timeDialog.period")}
            >
              {(["AM", "PM"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  className={cn("cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition", timeParts.period === period ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-primary/10 hover:text-foreground")}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerMove={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); updatePeriod(period); }}
                >
                  {period === "AM" ? t("createRequest.timeDialog.am") : t("createRequest.timeDialog.pm")}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Primitive UI helpers ─────────────────────────────────────────────────────

function PickerField({ label, icon, value, onClick }: { label: string; icon: "calendar" | "clock"; value: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-12 w-full items-center justify-between rounded-lg border border-input px-4 text-start text-sm font-medium text-muted-foreground transition hover:border-primary/50"
      onClick={onClick}
    >
      {value}
      <span className="text-primary">
        {icon === "calendar" ? <CalendarIcon className="size-5" /> : <ClockIcon className="size-5" />}
      </span>
    </button>
  );
}

function HiddenFieldMessage({ name }: { name: keyof CreateRequestFormValues }) {
  return (
    <FormField
      name={name}
      render={() => (
        <FormItem>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function DialogInput({ label, placeholder, value, className, onChange }: { label: string; placeholder: string; value: string; className?: string; onChange: (v: string) => void }) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-sm font-bold text-foreground">
        {label}
        <RequiredMark />
      </span>
      <Input
        className="h-11 rounded-lg"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TotalCostCard({ label, description, amount }: { label: string; description: string; amount: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/10 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-background text-primary">
          <CostIcon className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">{label}</p>
          <p className="text-xs font-medium text-muted-foreground">{description}</p>
        </div>
      </div>
      <span className="rounded-full bg-primary/10 px-4 py-2 text-lg font-bold text-primary">{amount}</span>
    </div>
  );
}

function PaymentRow({ label, value, tone }: { label: string; value: string; tone?: "danger" | "success" }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0">
      <span className="font-medium text-foreground">{label}</span>
      <span className={cn("font-bold text-foreground", tone === "danger" && "text-destructive", tone === "success" && "text-emerald-500")}>
        {value}
      </span>
    </div>
  );
}

function ProductThumbnail({ imageUrl }: { imageUrl?: string | null }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        className="size-8 shrink-0 rounded-sm object-cover"
      />
    );
  }
  return (
    <span className="grid size-8 shrink-0 grid-cols-3 gap-0.5 rounded-sm bg-slate-950 p-1">
      <span className="rounded-sm bg-slate-100" />
      <span className="rounded-sm bg-red-500" />
      <span className="rounded-sm bg-slate-100" />
      <span className="rounded-sm bg-slate-100" />
      <span className="rounded-sm bg-red-500" />
      <span className="rounded-sm bg-slate-100" />
    </span>
  );
}

function RequiredMark() {
  return <span className="text-destructive">*</span>;
}

// ─── Time-picker utilities ────────────────────────────────────────────────────

interface TimeParts {
  hour: number;
  minute: number;
  period: "AM" | "PM";
}

function formatTimeValue(value: string) {
  const [h = "0", m = "0"] = value.split(":");
  const hour = Number(h);
  const minute = Number(m);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

function parseDisplayTime(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return "";
  const [, hText, mText, pText] = match;
  const h = Number(hText);
  const normalized =
    pText.toUpperCase() === "PM" ? (h === 12 ? 12 : h + 12) : h === 12 ? 0 : h;
  return `${String(normalized).padStart(2, "0")}:${mText}`;
}

function getTimePartsFromInput(value: string): TimeParts {
  const [h = "9", m = "0"] = value.split(":");
  const h24 = Number(h);
  const minute = Number(m);
  return {
    hour: h24 % 12 || 12,
    minute: Number.isNaN(minute) ? 0 : minute,
    period: h24 >= 12 ? "PM" : "AM",
  };
}

function getInputFromTimeParts({ hour, minute, period }: TimeParts) {
  const h24 = period === "PM" ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour;
  return `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function getHourRotation({ hour, minute }: TimeParts) {
  return ((hour % 12) + minute / 60) * 30;
}

function getMinuteRotation({ minute }: TimeParts) {
  return minute * 6;
}

function getTimePartsFromClockPointer(
  el: HTMLElement,
  clientX: number,
  clientY: number,
  parts: TimeParts,
  hand: "hour" | "minute",
): TimeParts {
  const rect = el.getBoundingClientRect();
  const angle = (Math.atan2(clientY - (rect.top + rect.height / 2), clientX - (rect.left + rect.width / 2)) * 180) / Math.PI;
  const normalized = (angle + 90 + 360) % 360;
  if (hand === "hour") return { ...parts, hour: Math.round(normalized / 30) || 12 };
  return { ...parts, minute: Math.round(normalized / 6) % 60 };
}
