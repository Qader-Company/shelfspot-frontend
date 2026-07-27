"use client";

import { useDeferredValue, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  CheckCircle2,
  CircleDollarSign,
  Flame,
  Pencil,
  Plus,
  Tag,
  Ticket,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { FlowDialog } from "@/shared/components/flow-dialog";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { StatusBadge } from "@/shared/components/dashboard/status-badge";
import {
  EmptyState,
  ErrorState,
  PageLoadingSkeleton,
} from "@/shared/components/feedback";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

import { PromoDetailsDialog, PromoFormDialog } from "./dialogs";
import {
  useCreatePromoCode,
  useDeletePromoCode,
  usePromoCode,
  usePromoCodes,
  useUpdatePromoCode,
} from "./hooks";
import type {
  PromoCodeRecord,
  PromoFieldErrors,
  PromoListResult,
  PromoPayload,
  PromoStatus,
} from "./types";

const backendFieldMap: Record<string, keyof PromoPayload> = {
  code: "code",
  amount: "amount",
  max_redemptions: "maxRedemptions",
  expires_at: "expiresAt",
  is_active: "active",
  assigned_company_id: "assignedCompanyId",
  notes: "notes",
};

function getPromoFieldErrors(
  error: unknown,
  fallback: string,
  messages: Record<keyof PromoPayload, string>,
): PromoFieldErrors {
  if (!axios.isAxiosError(error)) return { code: fallback };
  const response = error.response?.data as
    | {
        message?: string;
        errors?: Record<string, string | string[]>;
      }
    | undefined;
  const result: PromoFieldErrors = {};
  Object.entries(response?.errors ?? {}).forEach(([backendKey]) => {
    const field = backendFieldMap[backendKey];
    if (field) result[field] = messages[field];
  });
  if (Object.keys(result).length === 0) {
    result.code = response?.message ?? fallback;
  }
  return result;
}

function statusOf(record: PromoCodeRecord): PromoStatus {
  if (record.expiresAt && new Date(record.expiresAt).getTime() < Date.now()) {
    return "expired";
  }
  return record.active ? "active" : "inactive";
}

export function PromoCodesPage() {
  const t = useTranslations("adminDashboard.promoCodes");
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search.trim());
  const [filter, setFilter] = useState<"all" | PromoStatus>("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCodeRecord | null>(null);
  const [detailsId, setDetailsId] = useState("");
  const [deleting, setDeleting] = useState<PromoCodeRecord | null>(null);
  const [actionError, setActionError] = useState("");
  const [formErrors, setFormErrors] = useState<PromoFieldErrors>({});
  const [success, setSuccess] = useState<"created" | "updated" | null>(null);
  const query = usePromoCodes({
    search: deferred,
    active:
      filter === "active" ? 1 : filter === "inactive" ? 0 : undefined,
    page,
    perPage: 8,
  });
  const details = usePromoCode(detailsId, Boolean(detailsId));
  const createMutation = useCreatePromoCode();
  const updateMutation = useUpdatePromoCode();
  const deleteMutation = useDeletePromoCode();
  const rows = (query.data?.data ?? []).filter(
    (record) => filter !== "expired" || statusOf(record) === "expired",
  );
  const active = rows.filter((record) => statusOf(record) === "active").length;
  const expired = rows.filter(
    (record) => statusOf(record) === "expired",
  ).length;
  const redemptions = rows.reduce(
    (sum, record) => sum + record.usedCount,
    0,
  );
  const revenue = rows
    .flatMap((record) => record.redemptions)
    .reduce((sum, item) => sum + item.amountSaved, 0);
  const cards = [
    {
      key: "active",
      value: active,
      icon: Flame,
      tone: "bg-primary/10 text-primary",
    },
    {
      key: "expired",
      value: expired,
      icon: Ticket,
      tone: "bg-destructive/10 text-destructive",
    },
    {
      key: "redemptions",
      value: redemptions,
      icon: Tag,
      tone: "bg-accent text-accent-foreground",
    },
    {
      key: "revenue",
      value: `$${revenue.toLocaleString()}`,
      icon: CircleDollarSign,
      tone: "bg-success/10 text-success",
    },
  ];

  function cacheSavedRecord(record: PromoCodeRecord, wasEditing: boolean) {
    client.setQueriesData<PromoListResult>(
      { queryKey: ["admin", "promo-codes", "list"] },
      (current) => {
        if (!current) return current;
        const exists = current.data.some((item) => item.id === record.id);
        const data = exists
          ? current.data.map((item) => (item.id === record.id ? record : item))
          : [record, ...current.data];
        return {
          ...current,
          data,
          meta: {
            ...current.meta,
            total: current.meta.total + (!wasEditing && !exists ? 1 : 0),
          },
        };
      },
    );
    client.setQueryData(
      ["admin", "promo-codes", "detail", record.id],
      record,
    );
  }

  async function save(input: PromoPayload) {
    setFormErrors({});
    try {
      const wasEditing = Boolean(editing);
      let saved: PromoCodeRecord;
      if (editing) {
        saved = await updateMutation.mutateAsync({ id: editing.id, input });
      } else {
        saved = await createMutation.mutateAsync(input);
      }
      cacheSavedRecord(saved, wasEditing);
      if (!wasEditing) {
        setSearch("");
        setFilter("all");
        setPage(1);
      }
      setFormOpen(false);
      setEditing(null);
      setSuccess(wasEditing ? "updated" : "created");
    } catch (error) {
      setFormErrors(
        getPromoFieldErrors(error, t("saveError"), {
          code: t("form.validation.code"),
          amount: t("form.validation.amount"),
          maxRedemptions: t("form.validation.maxRedemptions"),
          expiresAt: t("form.validation.expiry"),
          active: t("form.validation.active"),
          assignedCompanyId: t("form.validation.assignedCompanyId"),
          notes: t("form.validation.notes"),
        }),
      );
    }
  }

  async function remove() {
    if (!deleting) return;
    setActionError("");
    try {
      await deleteMutation.mutateAsync(deleting.id);
      client.setQueriesData<PromoListResult>(
        { queryKey: ["admin", "promo-codes", "list"] },
        (current) =>
          current
            ? {
                ...current,
                data: current.data.filter((item) => item.id !== deleting.id),
                meta: {
                  ...current.meta,
                  total: Math.max(0, current.meta.total - 1),
                },
              }
            : current,
      );
      setDeleting(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : t("deleteError"),
      );
    }
  }

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormErrors({});
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          {t("add")}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, value, icon: Icon, tone }) => (
          <div
            key={key}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
          >
            <span className={cn("rounded-full p-3", tone)}>
              <Icon />
            </span>
            <div>
              <p className="text-muted-foreground">{t(`stats.${key}`)}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          label={t("searchLabel")}
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="max-w-md"
        />
        <select
          aria-label={t("filterLabel")}
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value as typeof filter);
            setPage(1);
          }}
          className="ms-auto h-11 rounded-lg border border-border bg-card px-4"
        >
          <option value="all">{t("statuses.all")}</option>
          <option value="active">{t("statuses.active")}</option>
          <option value="inactive">{t("statuses.inactive")}</option>
          <option value="expired">{t("statuses.expired")}</option>
        </select>
      </div>

      {actionError ? (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-destructive"
        >
          {actionError}
        </p>
      ) : null}

      {query.isLoading ? (
        <PageLoadingSkeleton
          showHeader={false}
          cardCount={0}
          tableRows={8}
          tableColumns={7}
          label={t("loading")}
        />
      ) : query.isError ? (
        <ErrorState
          title={t("loadError")}
          description={t("loadErrorDescription")}
          retryLabel={t("retry")}
          onRetry={() => query.refetch()}
        />
      ) : rows.length ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="border-b">
                {[
                  "code",
                  "amount",
                  "maxRedemptions",
                  "used",
                  "expiry",
                  "status",
                  "action",
                ].map((key) => (
                  <th key={key} className="p-4 text-start">
                    {t(`columns.${key}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((record) => {
                const status = statusOf(record);
                return (
                  <tr key={record.id} className="border-b last:border-0">
                    <td className="p-4">
                      <button
                        className="font-medium hover:text-primary"
                        onClick={() => setDetailsId(record.id)}
                      >
                        {record.code}
                      </button>
                    </td>
                    <td className="p-4">{record.amount}</td>
                    <td className="p-4">{record.maxRedemptions}</td>
                    <td className="p-4">
                      {record.usedCount}/{record.maxRedemptions}
                    </td>
                    <td className="p-4">
                      {record.expiresAt
                        ? new Date(record.expiresAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-4">
                      <StatusBadge
                        status={
                          status === "active"
                            ? "active"
                            : status === "expired"
                              ? "failed"
                              : "inactive"
                        }
                        label={t(`statuses.${status}`)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t("edit")}
                          onClick={() => {
                            setEditing(record);
                            setFormErrors({});
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t("delete")}
                          onClick={() => setDeleting(record)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title={t("empty")} description={t("emptyDescription")} />
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          {t("previous")}
        </Button>
        <span className="rounded-lg bg-primary/10 px-4 py-2 text-primary">
          {page}
        </span>
        <Button
          variant="outline"
          disabled={page >= (query.data?.meta.lastPage ?? 1)}
          onClick={() => setPage(page + 1)}
        >
          {t("next")}
        </Button>
      </div>

      <PromoFormDialog
        open={formOpen}
        record={editing}
        serverErrors={formErrors}
        isPending={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
          setFormErrors({});
        }}
        onSubmit={save}
      />
      <PromoDetailsDialog
        record={details.data ?? null}
        onClose={() => setDetailsId("")}
      />
      <DeleteConfirmDialog
        isOpen={Boolean(deleting)}
        title={t("deleteDialog.title")}
        descriptionLine1={t("deleteDialog.description")}
        descriptionLine2={t("deleteDialog.warning")}
        cancelLabel={t("deleteDialog.cancel")}
        confirmLabel={t("deleteDialog.confirm")}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        isPending={deleteMutation.isPending}
      />
      <FlowDialog
        isOpen={Boolean(success)}
        onClose={() => setSuccess(null)}
        title={t(`success.${success ?? "created"}.title`)}
        closeLabel={t("success.close")}
        className="max-w-md text-center"
        footer={
          <Button className="w-full" onClick={() => setSuccess(null)}>
            {t("success.done")}
          </Button>
        }
      >
        <CheckCircle2 className="mx-auto size-14 text-success" />
        <p className="mt-4 text-muted-foreground">
          {t(`success.${success ?? "created"}.description`)}
        </p>
      </FlowDialog>
    </div>
  );
}
