"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { createRequestSteps } from "@/modules/dashboard/components/create-request.seed";
import { CreateRequestLayout } from "@/modules/dashboard/components/create-request-layout";
import { CreateRequestStepper } from "@/modules/dashboard/components/create-request-stepper";
import { FlowDialog } from "@/modules/dashboard/components/flow-dialog";
import { AnalogClockFace } from "@/shared/components/analog-clock-face";
import {
  AddIcon,
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

const productRows = [
  "dietDrinksOne",
  "dietDrinksTwo",
  "dietDrinksThree",
  "dietDrinksFour",
  "dietDrinksFive",
  "dietDrinksSix",
] as const;

const selectOptions = {
  serviceType: ["freshnessReport", "onShelfAvailability"],
  brand: ["pepsico"],
  subBrand: ["pepsiDiet"],
  category: ["softDrinks"],
  subCategory: ["softDrinks"],
} as const;

const saudiArabiaMapEmbedUrl =
  "https://www.openstreetmap.org/export/embed.html?bbox=34.4%2C16.3%2C55.7%2C32.2&layer=mapnik&marker=24.7136%2C46.6753";

function createRequestSchema(t: DashboardTranslate) {
  return z.object({
    executionDate: z
      .string()
      .min(1, t("createRequest.validation.executionDateRequired")),
    executionTime: z
      .string()
      .min(1, t("createRequest.validation.executionTimeRequired")),
    storeName: z.string().min(1, t("createRequest.validation.storeRequired")),
    streetAddress: z
      .string()
      .min(1, t("createRequest.validation.streetAddressRequired")),
    state: z.string().min(1, t("createRequest.validation.stateRequired")),
    region: z.string().min(1, t("createRequest.validation.regionRequired")),
    city: z.string().min(1, t("createRequest.validation.cityRequired")),
    district: z.string().optional(),
    serviceType: z
      .string()
      .min(1, t("createRequest.validation.serviceTypeRequired")),
    brand: z.string().min(1, t("createRequest.validation.brandRequired")),
    subBrand: z
      .string()
      .min(1, t("createRequest.validation.subBrandRequired")),
    category: z
      .string()
      .min(1, t("createRequest.validation.categoryRequired")),
    subCategory: z
      .string()
      .min(1, t("createRequest.validation.subCategoryRequired")),
    productIds: z
      .array(z.string())
      .min(1, t("createRequest.validation.productsRequired")),
    instructions: z
      .string()
      .min(10, t("createRequest.validation.instructionsRequired")),
  });
}

type CreateRequestFormValues = z.infer<ReturnType<typeof createRequestSchema>>;
type LocationFormValues = Pick<
  CreateRequestFormValues,
  "storeName" | "streetAddress" | "state" | "region" | "city" | "district"
>;

const defaultValues: CreateRequestFormValues = {
  executionDate: "",
  executionTime: "",
  storeName: "",
  streetAddress: "",
  state: "",
  region: "",
  city: "",
  district: "",
  serviceType: "",
  brand: "",
  subBrand: "",
  category: "",
  subCategory: "",
  productIds: [],
  instructions: "",
};

export function CreateRequestPage() {
  const t = useTranslations("dashboard");
  const schema = useMemo(() => createRequestSchema(t), [t]);
  const [openDialog, setOpenDialog] = useState<DialogName>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isLocationExpanded, setIsLocationExpanded] = useState(true);
  const [isServiceExpanded, setIsServiceExpanded] = useState(true);
  const [isGuidelinesExpanded, setIsGuidelinesExpanded] = useState(true);
  const [serviceCount, setServiceCount] = useState(1);
  const locationSectionRef = useRef<HTMLElement | null>(null);
  const serviceSectionRef = useRef<HTMLElement | null>(null);
  const guidelinesSectionRef = useRef<HTMLElement | null>(null);
  const form = useForm<CreateRequestFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  const values = useWatch({ control: form.control });
  const hasLocation = Boolean(values.storeName);
  const selectedProducts = values.productIds ?? [];
  const sectionRefs = useMemo(
    () => [
      locationSectionRef,
      serviceSectionRef,
      guidelinesSectionRef,
    ],
    [],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((firstEntry, secondEntry) => {
            return secondEntry.intersectionRatio - firstEntry.intersectionRatio;
          })[0];

        if (!visibleEntry) {
          return;
        }

        const nextIndex = Number(
          (visibleEntry.target as HTMLElement).dataset.stepIndex,
        );

        if (!Number.isNaN(nextIndex)) {
          setActiveStepIndex(nextIndex);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.2, 0.4, 0.6, 0.8],
      },
    );

    sectionRefs.forEach((sectionRef) => {
      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionRefs]);

  function resetRequest() {
    form.reset(defaultValues);
    setIsLocationExpanded(true);
    setIsServiceExpanded(true);
    setIsGuidelinesExpanded(true);
    setServiceCount(1);
  }

  function goToStep(index: number) {
    setActiveStepIndex(index);

    if (index === 0) {
      setIsLocationExpanded(true);
    }

    if (index === 1) {
      setIsServiceExpanded(true);
    }

    if (index === 2) {
      setIsGuidelinesExpanded(true);
    }

    window.requestAnimationFrame(() => {
      sectionRefs[index]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function saveLocation(locationValues: LocationFormValues) {
    Object.entries(locationValues).forEach(([fieldName, fieldValue]) => {
      form.setValue(fieldName as keyof LocationFormValues, fieldValue, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
    setOpenDialog(null);
  }

  function submitForPayment() {
    setOpenDialog("payment");
  }

  function confirmPayment() {
    setOpenDialog("success");
  }

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
            <SectionCard
              sectionRef={locationSectionRef}
              stepIndex={0}
              title={t("createRequest.location.title")}
              description={t("createRequest.location.description")}
              isExpanded={isLocationExpanded}
              toggleLabel={t("createRequest.actions.toggleSection")}
              onToggle={() => setIsLocationExpanded((current) => !current)}
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
                      value={
                        values.executionDate ||
                        t("createRequest.fields.executionDate.placeholder")
                      }
                      onClick={() => setOpenDialog("date")}
                    />
                    <PickerField
                      label={t("createRequest.fields.executionTime.label")}
                      icon="clock"
                      value={
                        values.executionTime ||
                        t("createRequest.fields.executionTime.placeholder")
                      }
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
                        {hasLocation
                          ? values.storeName
                          : t("createRequest.location.addLocation")}
                      </span>
                      <span className="mt-1 block text-xs font-medium leading-5 text-muted-foreground">
                        {hasLocation
                          ? values.streetAddress
                          : t("createRequest.location.addLocationDescription")}
                      </span>
                    </span>
                  </button>
                  <HiddenFieldMessage name="storeName" />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              sectionRef={serviceSectionRef}
              stepIndex={1}
              title={t("createRequest.services.title")}
              description={t("createRequest.services.description")}
              action={
                <Button
                  type="button"
                  className="h-11 rounded-lg px-5 text-sm font-semibold text-primary-foreground hover:text-primary-foreground"
                  onClick={() => setServiceCount(2)}
                >
                  <AddIcon className="size-5" />
                  {t("createRequest.actions.addService")}
                </Button>
              }
              isExpanded={isServiceExpanded}
              toggleLabel={t("createRequest.actions.toggleSection")}
              onToggle={() => setIsServiceExpanded((current) => !current)}
            >
              <div className="space-y-4">
                <ServiceSummary
                  label={t("createRequest.services.serviceLabel", {
                    index: 1,
                  })}
                  price={t("createRequest.mock.servicePrice")}
                  isExpanded={isServiceExpanded}
                  toggleLabel={t("createRequest.actions.toggleSection")}
                  deleteLabel={t("createRequest.actions.deleteService")}
                  onToggle={() =>
                    setIsServiceExpanded((current) => !current)
                  }
                />
                {isServiceExpanded ? (
                  <ServiceForm
                    t={t}
                    selectedProducts={selectedProducts}
                    onShowProducts={() => setOpenDialog("products")}
                  />
                ) : null}
                {serviceCount > 1 ? (
                  <ServiceSummary
                    label={t("createRequest.services.serviceLabel", {
                      index: 2,
                    })}
                    price={t("createRequest.mock.servicePrice")}
                    isExpanded={false}
                    toggleLabel={t("createRequest.actions.toggleSection")}
                    deleteLabel={t("createRequest.actions.deleteService")}
                    onToggle={() => undefined}
                    onDelete={() => setServiceCount(1)}
                  />
                ) : null}
                {serviceCount > 1 ? (
                  <TotalCostCard
                    label={t("createRequest.cost.title")}
                    description={t("createRequest.cost.description")}
                    amount={t("createRequest.cost.amount")}
                  />
                ) : null}
              </div>
            </SectionCard>

            <SectionCard
              sectionRef={guidelinesSectionRef}
              stepIndex={2}
              title={t("createRequest.guidelines.title")}
              description={t("createRequest.guidelines.description")}
              isExpanded={isGuidelinesExpanded}
              toggleLabel={t("createRequest.actions.toggleSection")}
              onToggle={() => setIsGuidelinesExpanded((current) => !current)}
            >
              <GuidelinesFields t={t} />
            </SectionCard>
          </form>
        </Form>
      </CreateRequestLayout>

      {openDialog === "date" ? (
        <DateDialog
          t={t}
          isOpen
          onClose={() => setOpenDialog(null)}
          onSelect={(date) => {
            form.setValue("executionDate", date, {
              shouldDirty: true,
              shouldValidate: true,
            });
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
            form.setValue("executionTime", time, {
              shouldDirty: true,
              shouldValidate: true,
            });
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
          }}
          onClose={() => setOpenDialog(null)}
          onSave={saveLocation}
        />
      ) : null}
      <ProductsDialog
        t={t}
        isOpen={openDialog === "products"}
        selectedProducts={selectedProducts}
        onClose={() => setOpenDialog(null)}
        onConfirm={() => setOpenDialog(null)}
        onToggle={(productId) => {
          const nextProducts = selectedProducts.includes(productId)
            ? selectedProducts.filter((id) => id !== productId)
            : [...selectedProducts, productId];
          form.setValue("productIds", nextProducts, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
      />
      <PaymentDialog
        t={t}
        isOpen={openDialog === "payment"}
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

function SectionCard({
  sectionRef,
  stepIndex,
  title,
  description,
  action,
  isExpanded,
  toggleLabel,
  children,
  onToggle,
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
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {description}
          </p>
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
            <PaginationNextIcon
              className={cn(
                "size-4 rotate-90 transition",
                isExpanded && "-rotate-90",
              )}
            />
          </Button>
        </div>
      </div>
      {isExpanded ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

function ServiceSummary({
  label,
  price,
  isExpanded,
  toggleLabel,
  deleteLabel,
  onToggle,
  onDelete,
}: {
  label: string;
  price: string;
  isExpanded: boolean;
  toggleLabel: string;
  deleteLabel: string;
  onToggle: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 px-5 py-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-bold text-foreground">{label}</h3>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500">
          {price}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="rounded-full bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
          aria-label={toggleLabel}
          onClick={onToggle}
        >
          <PaginationNextIcon
            className={cn(
              "size-4 rotate-90 transition",
              isExpanded && "-rotate-90",
            )}
          />
        </Button>
        {onDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="rounded-full bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive"
            aria-label={deleteLabel}
            onClick={onDelete}
          >
            <TrashIcon className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ServiceForm({
  t,
  selectedProducts,
  onShowProducts,
}: {
  t: DashboardTranslate;
  selectedProducts: string[];
  onShowProducts: () => void;
}) {
  return (
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
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="icon-lg"
            variant="ghost"
            className="rounded-full bg-primary/10 text-primary"
            aria-label={t("createRequest.actions.toggleSection")}
          >
            <PaginationNextIcon className="-rotate-90" />
          </Button>
          <Button
            type="button"
            size="icon-lg"
            variant="ghost"
            className="rounded-full text-muted-foreground"
            aria-label={t("createRequest.actions.removeServiceDraft")}
          >
            <CloseIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <SelectField
          name="serviceType"
          label={t("createRequest.fields.serviceType.label")}
          placeholder={t("createRequest.fields.serviceType.placeholder")}
          options={selectOptions.serviceType.map((value) => ({
            value,
            label: t(`createRequest.options.services.${value}`),
          }))}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <ReadOnlyField
            label={t("createRequest.fields.estimatedTime.label")}
            value={t("createRequest.mock.estimatedTime")}
          />
          <ReadOnlyField
            label={t("createRequest.fields.price.label")}
            value={t("createRequest.mock.price")}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <SelectField
            name="brand"
            label={t("createRequest.fields.brand.label")}
            placeholder={t("createRequest.fields.brand.placeholder")}
            required
            options={selectOptions.brand.map((value) => ({
              value,
              label: t(`createRequest.options.brands.${value}`),
            }))}
          />
          <SelectField
            name="subBrand"
            label={t("createRequest.fields.subBrand.label")}
            placeholder={t("createRequest.fields.subBrand.placeholder")}
            required
            options={selectOptions.subBrand.map((value) => ({
              value,
              label: t(`createRequest.options.subBrands.${value}`),
            }))}
          />
          <SelectField
            name="category"
            label={t("createRequest.fields.category.label")}
            placeholder={t("createRequest.fields.category.placeholder")}
            required
            options={selectOptions.category.map((value) => ({
              value,
              label: t(`createRequest.options.categories.${value}`),
            }))}
          />
          <SelectField
            name="subCategory"
            label={t("createRequest.fields.subCategory.label")}
            placeholder={t("createRequest.fields.subCategory.placeholder")}
            required
            options={selectOptions.subCategory.map((value) => ({
              value,
              label: t(`createRequest.options.subCategories.${value}`),
            }))}
          />
        </div>

        <ProductTable
          t={t}
          selectedProducts={selectedProducts}
          onShowProducts={onShowProducts}
        />
        <HiddenFieldMessage name="productIds" />

        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none"
          >
            <PaginationPreviousIcon className="size-4 rtl:rotate-180" />
            {t("createRequest.pagination.previous")}
          </Button>
          <div className="flex items-center gap-2">
            {["1", "2", "3", "ellipsis", "8", "9", "10"].map((page) => (
              <Button
                key={page}
                type="button"
                variant="ghost"
                size="icon-sm"
                className={cn(
                  "rounded-lg text-sm text-muted-foreground",
                  page === "1" && "bg-primary/15 text-primary",
                )}
              >
                {page === "ellipsis" ? t("createRequest.pagination.ellipsis") : page}
              </Button>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none"
          >
            {t("createRequest.pagination.next")}
            <PaginationNextIcon className="size-4 rtl:rotate-180" />
          </Button>
        </div>

      </div>
    </div>
  );
}

function ProductTable({
  t,
  selectedProducts,
  onShowProducts,
}: {
  t: DashboardTranslate;
  selectedProducts: string[];
  onShowProducts: () => void;
}) {
  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          className="h-11 flex-1 rounded-lg px-4 text-sm"
          placeholder={t("createRequest.productTable.searchPlaceholder")}
        />
        <button
          type="button"
          className="text-sm font-bold text-primary underline-offset-4 hover:underline"
          onClick={onShowProducts}
        >
          {t("createRequest.productTable.showProducts")}
        </button>
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-border">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-muted/20 text-xs font-bold text-muted-foreground">
            <tr>
              <th className="w-16 border-b border-e border-border px-4 py-3 text-start">
                <input type="checkbox" className="size-4 accent-primary" />
              </th>
              <th className="border-b border-e border-border px-4 py-3 text-start">
                {t("createRequest.productTable.columns.products")}
              </th>
              <th className="border-b border-e border-border px-4 py-3 text-center">
                {t("createRequest.productTable.columns.sku")}
              </th>
              <th className="border-b border-e border-border px-4 py-3 text-center">
                {t("createRequest.productTable.columns.details")}
              </th>
              <th className="border-b border-border px-4 py-3 text-center">
                {t("createRequest.productTable.columns.expiryDate")}
              </th>
            </tr>
          </thead>
          <tbody>
            {productRows.map((productId) => {
              const isSelected = selectedProducts.includes(productId);

              return (
                <tr key={productId} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={isSelected}
                      readOnly
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <ProductThumbnail />
                      <span className="font-bold text-foreground">
                        {t(`createRequest.mock.products.${productId}.name`)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-muted-foreground">
                    {t(`createRequest.mock.products.${productId}.sku`)}
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-muted-foreground">
                    {t("createRequest.productTable.emptyDetail")}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-3 font-medium text-muted-foreground">
                      {t(`createRequest.mock.products.${productId}.expiryDate`)}
                      <EditIcon className="size-4 text-primary" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GuidelinesFields({ t }: { t: DashboardTranslate }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-base font-bold text-foreground">
          {t("createRequest.guidelines.documents")}
        </h4>
        <div className="mt-3 rounded-lg border border-dashed border-border px-5 py-8 text-center">
          <UploadIcon className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-2 text-base font-bold text-muted-foreground">
            {t("createRequest.guidelines.uploadTitle")}
          </p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {t("createRequest.guidelines.uploadDescription")}
          </p>
          <p className="mt-2 text-xs font-semibold text-primary">
            {t("createRequest.guidelines.supportedFormats")}
          </p>
        </div>
      </div>
      <FormField
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

function LocationDialog({
  t,
  isOpen,
  initialValues,
  onClose,
  onSave,
}: {
  t: DashboardTranslate;
  isOpen: boolean;
  initialValues: LocationFormValues;
  onClose: () => void;
  onSave: (values: LocationFormValues) => void;
}) {
  const [activeTab, setActiveTab] = useState<"map" | "manual">("manual");
  const [locationValues, setLocationValues] =
    useState<LocationFormValues>(initialValues);
  const [pinPosition, setPinPosition] = useState({ x: 50, y: 50 });

  function updateLocationField(
    fieldName: keyof LocationFormValues,
    fieldValue: string,
  ) {
    setLocationValues((currentValues) => ({
      ...currentValues,
      [fieldName]: fieldValue,
    }));
  }

  function selectMapPoint(event: React.MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setPinPosition({
      x: Math.min(92, Math.max(8, x)),
      y: Math.min(85, Math.max(15, y)),
    });

    setLocationValues((currentValues) => ({
      ...currentValues,
      storeName:
        currentValues.storeName || t("createRequest.mock.location.storeName"),
      streetAddress:
        currentValues.streetAddress ||
        t("createRequest.mock.location.streetAddress"),
      state: currentValues.state || t("createRequest.mock.location.state"),
      region: currentValues.region || t("createRequest.mock.location.region"),
      city: currentValues.city || t("createRequest.mock.location.city"),
      district:
        currentValues.district || t("createRequest.mock.location.district"),
    }));
  }

  return (
    <FlowDialog
      title={t("createRequest.locationDialog.title")}
      closeLabel={t("createRequest.actions.closeDialog")}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <Button
          type="button"
          className="h-12 w-full rounded-lg text-sm font-semibold"
          onClick={() => onSave(locationValues)}
        >
          {t("createRequest.actions.save")}
        </Button>
      }
    >
      <div className="mb-4 flex gap-6 border-b border-border">
        <button
          className={cn(
            "pb-3 text-sm font-semibold",
            activeTab === "map"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground",
          )}
          type="button"
          onClick={() => setActiveTab("map")}
        >
          {t("createRequest.locationDialog.tabs.map")}
        </button>
        <button
          className={cn(
            "pb-3 text-sm font-semibold",
            activeTab === "manual"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground",
          )}
          type="button"
          onClick={() => setActiveTab("manual")}
        >
          {t("createRequest.locationDialog.tabs.manual")}
        </button>
      </div>
      {activeTab === "map" ? (
        <div className="space-y-4">
          <button
            type="button"
            className="relative min-h-44 w-full overflow-hidden rounded-lg bg-muted text-start"
            aria-label={t("createRequest.locationDialog.mapLabel")}
            onClick={selectMapPoint}
          >
            <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,transparent_46%,hsl(var(--background))_46%,hsl(var(--background))_54%,transparent_54%),linear-gradient(0deg,transparent_0,transparent_42%,hsl(var(--background))_42%,hsl(var(--background))_50%,transparent_50%),linear-gradient(35deg,transparent_0,transparent_48%,hsl(var(--background))_48%,hsl(var(--background))_52%,transparent_52%)] opacity-80" />
            <span
              className="absolute flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
              style={{
                left: `${pinPosition.x}%`,
                top: `${pinPosition.y}%`,
              }}
            >
              <MapPinIcon className="size-5" />
            </span>
            <span className="absolute bottom-3 start-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-muted-foreground">
              {t("createRequest.locationDialog.mapHint")}
            </span>
          </button>
          <DialogInput
            label={t("createRequest.locationDialog.fields.storeName.label")}
            placeholder={t(
              "createRequest.locationDialog.fields.storeName.placeholder",
            )}
            value={locationValues.storeName}
            onChange={(value) => updateLocationField("storeName", value)}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <DialogInput
            className="md:col-span-2"
            label={t("createRequest.locationDialog.fields.storeName.label")}
            placeholder={t(
              "createRequest.locationDialog.fields.storeName.placeholder",
            )}
            value={locationValues.storeName}
            onChange={(value) => updateLocationField("storeName", value)}
          />
          <DialogInput
            className="md:col-span-2"
            label={t("createRequest.locationDialog.fields.streetAddress.label")}
            placeholder={t(
              "createRequest.locationDialog.fields.streetAddress.placeholder",
            )}
            value={locationValues.streetAddress}
            onChange={(value) => updateLocationField("streetAddress", value)}
          />
          <DialogInput
            label={t("createRequest.locationDialog.fields.state.label")}
            placeholder={t(
              "createRequest.locationDialog.fields.state.placeholder",
            )}
            value={locationValues.state}
            onChange={(value) => updateLocationField("state", value)}
          />
          <DialogInput
            label={t("createRequest.locationDialog.fields.region.label")}
            placeholder={t(
              "createRequest.locationDialog.fields.region.placeholder",
            )}
            value={locationValues.region}
            onChange={(value) => updateLocationField("region", value)}
          />
          <DialogInput
            label={t("createRequest.locationDialog.fields.city.label")}
            placeholder={t(
              "createRequest.locationDialog.fields.city.placeholder",
            )}
            value={locationValues.city}
            onChange={(value) => updateLocationField("city", value)}
          />
          <DialogInput
            label={t("createRequest.locationDialog.fields.district.label")}
            placeholder={t(
              "createRequest.locationDialog.fields.district.placeholder",
            )}
            value={locationValues.district ?? ""}
            onChange={(value) => updateLocationField("district", value)}
          />
        </div>
      )}
    </FlowDialog>
  );
}

function DateDialog({
  t,
  isOpen,
  onClose,
  onSelect,
}: {
  t: DashboardTranslate;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
}) {
  const [visibleDate, setVisibleDate] = useState(() => new Date(2026, 4, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(visibleDate);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = (firstDay + 6) % 7;
  const calendarDays = [
    ...Array.from({ length: leadingDays }, (_, index) => ({
      date: new Date(year, month, index - leadingDays + 1),
      isCurrentMonth: false,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      date: new Date(year, month, index + 1),
      isCurrentMonth: true,
    })),
  ];
  const trailingDays = (7 - (calendarDays.length % 7)) % 7;
  const fullCalendarDays = [
    ...calendarDays,
    ...Array.from({ length: trailingDays }, (_, index) => ({
      date: new Date(year, month + 1, index + 1),
      isCurrentMonth: false,
    })),
  ];

  function moveMonth(direction: -1 | 1) {
    setVisibleDate((currentDate) => {
      return new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    });
  }

  function selectDate(date: Date) {
    setSelectedDate(date);
    onSelect(
      new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date),
    );
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
            onClick={() => setIsYearPickerOpen((current) => !current)}
          >
            <h3 className="text-3xl font-bold text-foreground">
              {monthLabel}
            </h3>
            <SidebarChevronIcon className="size-5 text-primary" />
          </button>
          <div className="flex items-center gap-2 text-primary">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-primary"
              aria-label={t("createRequest.dateDialog.previousMonth")}
              onClick={() => moveMonth(-1)}
            >
              <PaginationPreviousIcon className="size-5 rtl:rotate-180" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-primary"
              aria-label={t("createRequest.dateDialog.nextMonth")}
              onClick={() => moveMonth(1)}
            >
              <PaginationNextIcon className="size-5 rtl:rotate-180" />
            </Button>
          </div>
        </div>
        {isYearPickerOpen ? (
          <div className="mt-5 grid grid-cols-4 gap-2 rounded-lg bg-muted/40 p-3">
            {Array.from({ length: 8 }, (_, index) => year - 3 + index).map(
              (yearOption) => (
                <button
                  key={yearOption}
                  type="button"
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-primary/10 hover:text-primary",
                    yearOption === year && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  )}
                  onClick={() => {
                    setVisibleDate(new Date(yearOption, month, 1));
                    setIsYearPickerOpen(false);
                  }}
                >
                  {yearOption}
                </button>
              ),
            )}
          </div>
        ) : null}
        <div className="mt-8 grid grid-cols-7 gap-5 text-center">
          {[
            "mon",
            "tue",
            "wed",
            "thu",
            "fri",
            "sat",
            "sun",
          ].map((day) => (
            <span key={day} className="text-base font-medium text-muted-foreground">
              {t(`createRequest.dateDialog.days.${day}`)}
            </span>
          ))}
          {fullCalendarDays.map(({ date, isCurrentMonth }) => {
            const isSelected =
              selectedDate?.toDateString() === date.toDateString();

            return (
            <button
              key={date.toISOString()}
              type="button"
              className={cn(
                "rounded-lg py-1 text-2xl font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-foreground",
                isCurrentMonth && "text-foreground",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
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
  t,
  isOpen,
  onClose,
  value,
  onSelect,
}: {
  t: DashboardTranslate;
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onSelect: (time: string) => void;
}) {
  const initialInputValue = parseDisplayTime(value) || "09:00";
  const [timeParts, setTimeParts] = useState(() =>
    getTimePartsFromInput(initialInputValue),
  );
  const [activeClockStep, setActiveClockStep] = useState<
    "hour" | "minute" | "period"
  >(
    "hour",
  );
  const { isExiting, isMounted } = useDialogPresence(isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const nextInputValue = parseDisplayTime(value) || "09:00";

    setTimeParts(getTimePartsFromInput(nextInputValue));
    setActiveClockStep("hour");
  }, [isOpen, value]);

  function updateTimeParts(nextParts: TimeParts) {
    const nextInputValue = getInputFromTimeParts(nextParts);

    setTimeParts(nextParts);
    onSelect(formatTimeValue(nextInputValue));
  }

  function updatePeriod(period: TimeParts["period"]) {
    updateTimeParts({
      ...timeParts,
      period,
    });
    onClose();
  }

  function updateTimeFromClock(event: React.PointerEvent<HTMLDivElement>) {
    if (activeClockStep === "period") {
      return;
    }

    const nextParts = getTimePartsFromClockPointer(
      event.currentTarget,
      event.clientX,
      event.clientY,
      timeParts,
      activeClockStep,
    );

    updateTimeParts(nextParts);
  }

  function completeClockStep() {
    if (activeClockStep === "hour") {
      setActiveClockStep("minute");
      return;
    }

    if (activeClockStep === "minute") {
      setActiveClockStep("period");
    }
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-[1px]",
        isExiting ? "dialog-overlay-out" : "dialog-overlay-in",
      )}
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("createRequest.timeDialog.title")}
        className={isExiting ? "clock-overlay-out" : "clock-overlay-pop"}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          role="group"
          className="relative block aspect-square w-[min(82vw,20rem)] cursor-pointer touch-none overflow-hidden rounded-full border border-primary/30 bg-card/95 shadow-2xl ring-8 ring-primary/10 backdrop-blur"
          aria-label={t("createRequest.timeDialog.clockFace")}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            updateTimeFromClock(event);
          }}
          onPointerMove={(event) => {
            if (event.buttons === 1) {
              updateTimeFromClock(event);
            }
          }}
          onPointerUp={(event) => {
            event.currentTarget.releasePointerCapture(event.pointerId);
            completeClockStep();
          }}
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
                  className={cn(
                    "cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition",
                    timeParts.period === period
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                  )}
                  onPointerDown={(event) => event.stopPropagation()}
                  onPointerMove={(event) => event.stopPropagation()}
                  onPointerUp={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    updatePeriod(period);
                  }}
                >
                  {period === "AM"
                    ? t("createRequest.timeDialog.am")
                    : t("createRequest.timeDialog.pm")}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProductsDialog({
  t,
  isOpen,
  selectedProducts,
  onClose,
  onConfirm,
  onToggle,
}: {
  t: DashboardTranslate;
  isOpen: boolean;
  selectedProducts: string[];
  onClose: () => void;
  onConfirm: () => void;
  onToggle: (productId: string) => void;
}) {
  const visibleProducts = selectedProducts.length ? selectedProducts : productRows.slice(0, 4);

  return (
    <FlowDialog
      title={t("createRequest.productsDialog.title")}
      closeLabel={t("createRequest.actions.closeDialog")}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <Button
          type="button"
          className="h-12 w-full rounded-lg text-sm font-semibold"
          onClick={onConfirm}
        >
          {t("createRequest.actions.confirm")}
        </Button>
      }
    >
      <p className="text-sm font-semibold text-muted-foreground">
        {t("createRequest.productsDialog.selectedCount")}
      </p>
      <div className="mt-4 space-y-3">
        {visibleProducts.map((productId) => (
          <div
            key={productId}
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={selectedProducts.includes(productId)}
                onChange={() => onToggle(productId)}
              />
              <ProductThumbnail />
              <div>
                <p className="text-sm font-bold text-foreground">
                  {t(`createRequest.mock.products.${productId}.name`)}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {t(`createRequest.mock.products.${productId}.skuLong`)}
                </p>
              </div>
            </div>
            <TrashIcon className="size-4 text-muted-foreground" />
          </div>
        ))}
      </div>
    </FlowDialog>
  );
}

function PaymentDialog({
  t,
  isOpen,
  onClose,
  onConfirm,
}: {
  t: DashboardTranslate;
  isOpen: boolean;
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
            onClick={onClose}
          >
            {t("createRequest.actions.cancelPayment")}
          </Button>
          <Button
            type="button"
            className="h-12 rounded-lg text-sm font-semibold"
            onClick={onConfirm}
          >
            {t("createRequest.actions.confirm")}
          </Button>
        </div>
      }
    >
      <p className="text-sm font-bold text-foreground">
        {t("createRequest.paymentDialog.reviewTitle")}
      </p>
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-muted/20">
        <PaymentRow
          label={t("createRequest.paymentDialog.currentBalance")}
          value={t("createRequest.paymentDialog.currentBalanceValue")}
        />
        <PaymentRow
          label={t("createRequest.paymentDialog.amountToHold")}
          value={t("createRequest.paymentDialog.amountToHoldValue")}
          tone="danger"
        />
        <PaymentRow
          label={t("createRequest.paymentDialog.remainingBalance")}
          value={t("createRequest.paymentDialog.remainingBalanceValue")}
          tone="success"
        />
      </div>
      <div className="mt-4 rounded-lg border border-emerald-500 bg-emerald-500/10 p-4">
        <h3 className="font-bold text-foreground">
          {t("createRequest.paymentDialog.howItWorks.title")}
        </h3>
        <ol className="mt-2 list-decimal space-y-1 ps-5 text-xs font-medium leading-5 text-muted-foreground">
          <li>{t("createRequest.paymentDialog.howItWorks.hold")}</li>
          <li>{t("createRequest.paymentDialog.howItWorks.completed")}</li>
          <li>{t("createRequest.paymentDialog.howItWorks.refund")}</li>
        </ol>
      </div>
      <div className="mt-4 rounded-lg border border-orange-400 bg-orange-400/10 p-4">
        <h3 className="font-bold text-foreground">
          {t("createRequest.paymentDialog.status.title")}
        </h3>
        <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">
          {t("createRequest.paymentDialog.status.description")}
        </p>
      </div>
    </FlowDialog>
  );
}

function PickerField({
  label,
  icon,
  value,
  onClick,
}: {
  label: string;
  icon: "calendar" | "clock";
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-12 w-full items-center justify-between rounded-lg border border-input px-4 text-start text-sm font-medium text-muted-foreground transition hover:border-primary/50"
      onClick={onClick}
    >
      {value}
      <span className="text-primary">
        {icon === "calendar" ? (
          <CalendarIcon className="size-5" />
        ) : (
          <ClockIcon className="size-5" />
        )}
      </span>
    </button>
  );
}

function SelectField({
  name,
  label,
  placeholder,
  options,
  required = false,
}: {
  name: keyof CreateRequestFormValues;
  label: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-bold">
            {label}
            {required ? <RequiredMark /> : null}
          </FormLabel>
          <FormControl>
            <select
              {...field}
              className="h-12 w-full rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
            >
              <option value="">{placeholder}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-foreground">{label}</p>
      <div className="mt-2 flex h-12 items-center rounded-lg border border-input px-4 text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

function DialogInput({
  label,
  placeholder,
  value,
  className,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  className?: string;
  onChange: (value: string) => void;
}) {
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
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function formatTimeValue(value: string) {
  const [hourValue = "0", minuteValue = "0"] = value.split(":");
  const hour = Number(hourValue);
  const minute = Number(minuteValue);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

function parseDisplayTime(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

  if (!match) {
    return "";
  }

  const [, hourText, minuteText, periodText] = match;
  const hour = Number(hourText);
  const normalizedHour =
    periodText.toUpperCase() === "PM"
      ? hour === 12
        ? 12
        : hour + 12
      : hour === 12
        ? 0
        : hour;

  return `${String(normalizedHour).padStart(2, "0")}:${minuteText}`;
}

interface TimeParts {
  hour: number;
  minute: number;
  period: "AM" | "PM";
}

function getTimePartsFromInput(value: string): TimeParts {
  const [hourValue = "9", minuteValue = "0"] = value.split(":");
  const hour24 = Number(hourValue);
  const minute = Number(minuteValue);
  const period = hour24 >= 12 ? "PM" : "AM";

  return {
    hour: hour24 % 12 || 12,
    minute: Number.isNaN(minute) ? 0 : minute,
    period,
  };
}

function getInputFromTimeParts({ hour, minute, period }: TimeParts) {
  const hour24 =
    period === "PM" ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour;

  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function getHourRotation({ hour, minute }: TimeParts) {
  return ((hour % 12) + minute / 60) * 30;
}

function getMinuteRotation({ minute }: TimeParts) {
  return minute * 6;
}

function getTimePartsFromClockPointer(
  clockElement: HTMLElement,
  clientX: number,
  clientY: number,
  timeParts: TimeParts,
  activeHand: "hour" | "minute",
): TimeParts {
  const rect = clockElement.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const angle =
    (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI;
  const normalizedAngle = (angle + 90 + 360) % 360;

  if (activeHand === "hour") {
    const nextHour = Math.round(normalizedAngle / 30) || 12;

    return {
      ...timeParts,
      hour: nextHour,
    };
  }

  return {
    ...timeParts,
    minute: Math.round(normalizedAngle / 6) % 60,
  };
}

function ProductThumbnail() {
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

function TotalCostCard({
  label,
  description,
  amount,
}: {
  label: string;
  description: string;
  amount: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/10 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-background text-primary">
          <CostIcon className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">{label}</p>
          <p className="text-xs font-medium text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <span className="rounded-full bg-primary/10 px-4 py-2 text-lg font-bold text-primary">
        {amount}
      </span>
    </div>
  );
}

function PaymentRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "danger" | "success";
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0">
      <span className="font-medium text-foreground">{label}</span>
      <span
        className={cn(
          "font-bold text-foreground",
          tone === "danger" && "text-destructive",
          tone === "success" && "text-emerald-500",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function RequiredMark() {
  return <span className="text-destructive">*</span>;
}
