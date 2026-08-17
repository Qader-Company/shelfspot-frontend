"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FlowDialog } from "@/shared/components/flow-dialog";
import { Button } from "@/shared/ui/button";

import type {
  PromoCodeRecord,
  PromoFieldErrors,
  PromoPayload,
} from "./types";

const emptyValues: PromoPayload = {
  code: "",
  amount: 0,
  maxRedemptions: 1,
  expiresAt: "",
  active: true,
  assignedCompanyId: "",
  notes: "",
};

export function PromoFormDialog({
  open,
  record,
  serverErrors,
  isPending,
  onClose,
  onSubmit,
}: {
  open: boolean;
  record: PromoCodeRecord | null;
  serverErrors?: PromoFieldErrors;
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (payload: PromoPayload) => void;
}) {
  const t = useTranslations("adminDashboard.promoCodes.form");
  const schema = useMemo(
    () =>
      z.object({
        code: z.string().trim().min(2, t("validation.code")),
        amount: z.number().positive(t("validation.amount")),
        maxRedemptions: z
          .number()
          .int()
          .positive(t("validation.maxRedemptions")),
        expiresAt: z.string().min(1, t("validation.expiry")),
        active: z.boolean(),
        assignedCompanyId: z.string(),
        notes: z.string(),
      }),
    [t],
  );
  const form = useForm<PromoPayload>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      record
        ? {
            code: record.code,
            amount: record.amount,
            maxRedemptions: record.maxRedemptions,
            expiresAt: record.expiresAt.slice(0, 10),
            active: record.active,
            assignedCompanyId: record.assignedCompanyId,
            notes: record.notes,
          }
        : emptyValues,
    );
  }, [form, open, record]);

  const field =
    "h-12 w-full rounded-lg border border-border bg-muted px-3 outline-none focus:border-primary";

  return (
    <FlowDialog
      isOpen={open}
      onClose={onClose}
      title={t(record ? "editTitle" : "createTitle")}
      closeLabel={t("close")}
      className="max-w-3xl"
      footer={
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button disabled={isPending} onClick={form.handleSubmit(onSubmit)}>
            {isPending ? t("saving") : t(record ? "save" : "create")}
          </Button>
        </div>
      }
    >
      <form
        className="grid gap-5 sm:grid-cols-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Field
          label={t("code")}
          error={form.formState.errors.code?.message ?? serverErrors?.code}
          className="sm:col-span-2"
        >
          <input
            {...form.register("code")}
            className={field}
            placeholder={t("codePlaceholder")}
          />
        </Field>
        <Field
          label={t("amount")}
          error={form.formState.errors.amount?.message ?? serverErrors?.amount}
        >
          <input
            type="number"
            step="0.01"
            {...form.register("amount", { valueAsNumber: true })}
            className={field}
            placeholder={t("amountPlaceholder")}
          />
        </Field>
        <Field
          label={t("maxRedemptions")}
          error={
            form.formState.errors.maxRedemptions?.message ??
            serverErrors?.maxRedemptions
          }
        >
          <input
            type="number"
            {...form.register("maxRedemptions", { valueAsNumber: true })}
            className={field}
            placeholder={t("maxRedemptionsPlaceholder")}
          />
        </Field>
        <Field
          label={t("expiry")}
          error={
            form.formState.errors.expiresAt?.message ?? serverErrors?.expiresAt
          }
        >
          <input
            type="date"
            {...form.register("expiresAt")}
            className={field}
          />
        </Field>
        <Field
          label={t("assignedCompanyId")}
          optionalLabel={t("optional")}
          error={serverErrors?.assignedCompanyId}
        >
          <input
            inputMode="numeric"
            {...form.register("assignedCompanyId")}
            className={field}
            placeholder={t("assignedCompanyIdPlaceholder")}
          />
        </Field>
        <Field
          label={t("notes")}
          optionalLabel={t("optional")}
          error={serverErrors?.notes}
          className="sm:col-span-2"
        >
          <textarea
            {...form.register("notes")}
            className="min-h-24 w-full rounded-lg border border-border bg-muted p-3 outline-none focus:border-primary"
            placeholder={t("notesPlaceholder")}
          />
        </Field>
        <label className="flex items-center justify-between sm:col-span-2">
          <span>
            <strong className="block">{t("status")}</strong>
            <small className="text-muted-foreground">
              {t("statusDescription")}
            </small>
          </span>
          <input
            type="checkbox"
            {...form.register("active")}
            className="size-5 accent-primary"
          />
          {serverErrors?.active ? (
            <span className="text-xs text-destructive">
              {serverErrors.active}
            </span>
          ) : null}
        </label>
      </form>
    </FlowDialog>
  );
}

function Field({
  label,
  optionalLabel,
  error,
  className,
  children,
}: {
  label: string;
  optionalLabel?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block font-semibold">
        {label}
        {optionalLabel ? (
          <small className="ms-1 font-normal text-muted-foreground">
            {optionalLabel}
          </small>
        ) : (
          <span className="text-destructive">*</span>
        )}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-destructive">{error}</span>
      ) : null}
    </label>
  );
}

export function PromoDetailsDialog({
  record,
  onClose,
}: {
  record: PromoCodeRecord | null;
  onClose: () => void;
}) {
  const t = useTranslations("adminDashboard.promoCodes.details");
  if (!record) return null;
  const remaining = Math.max(record.maxRedemptions - record.usedCount, 0);
  const total = record.redemptions.reduce(
    (sum, item) => sum + item.amountSaved,
    0,
  );

  return (
    <FlowDialog
      isOpen
      title={t("title")}
      closeLabel={t("close")}
      onClose={onClose}
      className="max-w-3xl"
    >
      <div className="space-y-5">
        <Info label={t("code")} value={record.code} highlight />
        <div className="grid gap-3 sm:grid-cols-4">
          <Info label={t("amount")} value={record.amount} />
          <Info label={t("used")} value={record.usedCount} />
          <Info label={t("limit")} value={record.maxRedemptions} />
          <Info label={t("remaining")} value={remaining} />
        </div>
        <Info
          label={t("expiry")}
          value={new Date(record.expiresAt).toLocaleDateString()}
        />
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-start">{t("company")}</th>
                <th className="p-3 text-start">{t("usedDate")}</th>
                <th className="p-3 text-start">{t("saved")}</th>
              </tr>
            </thead>
            <tbody>
              {record.redemptions.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3">
                    <strong>{item.company}</strong>
                    <small className="block text-muted-foreground">
                      {item.country}
                    </small>
                  </td>
                  <td className="p-3">
                    {new Date(item.usedDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">${item.amountSaved}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted">
                <td colSpan={2} className="p-3">
                  {t("total")}
                </td>
                <td className="p-3 font-bold">${total}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </FlowDialog>
  );
}

function Info({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 font-semibold">{label}</p>
      <p
        className={`rounded-lg border px-3 py-3 ${
          highlight
            ? "border-primary bg-primary/10"
            : "border-transparent bg-muted"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
