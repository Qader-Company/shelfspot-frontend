"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { usePermission } from "@/shared/components/auth/permission-provider";
import {
  BackChevronIcon,
  CalendarIcon,
  ClockIcon,
  SidebarChevronIcon,
  ViewIcon,
  WarningIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import {
  StatusBadge,
  type StatusBadgeStatus,
} from "@/shared/components/dashboard/status-badge";
import { ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { Button } from "@/shared/ui/button";
import { useTaskMutations, useTaskQuery } from "@/modules/company/requests/details/use-query";
import type {
  CompanyTask,
  CompanyTaskAttachment,
  CompanyTaskProduct,
  CompanyTaskService,
} from "@/modules/company/requests/details/types";

const rejectionReasons = [
  "poorExecution",
  "planogram",
  "photosMissing",
  "products",
  "late",
  "other",
] as const;

function badgeStatus(status: string): StatusBadgeStatus {
  if (status === "in_progress" || status === "started") return "inProgress";
  if (["completed", "accepted", "rejected", "reopened"].includes(status)) {
    return status as StatusBadgeStatus;
  }
  return "completed";
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string | null | undefined, locale: string) {
  const date = parseDate(value);
  return date
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
    : "—";
}

function formatDuration(start?: string | null, end?: string | null) {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (!startDate || !endDate) return "—";
  const minutes = Math.max(
    0,
    Math.round((endDate.getTime() - startDate.getTime()) / 60_000),
  );
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function labelize(value: string) {
  return value
    .replace(/_files$/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function valueText(value: unknown): string {
  if (typeof value === "boolean") return value ? "✓" : "—";
  if (Array.isArray(value)) return value.map(valueText).join(", ");
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${labelize(key)}: ${valueText(item)}`)
      .join(" · ");
  }
  return value == null || value === "" ? "—" : String(value);
}

function AttachmentEvidence({ attachments }: { attachments: CompanyTaskAttachment[] }) {
  const t = useTranslations("dashboard.executionDetails");
  const photos = attachments.filter((item) => item.mime_type.startsWith("image/"));
  const files = attachments.filter((item) => !item.mime_type.startsWith("image/"));
  if (!attachments.length) return null;

  return (
    <section className="space-y-3">
      <h4 className="text-lg font-semibold">{t("photos")}</h4>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {photos.map((photo) => {
          const kind = `${photo.field} ${photo.collection}`.toLowerCase();
          const isBefore = kind.includes("before");
          return (
            <a
              key={photo.id}
              href={photo.url}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden rounded-xl border bg-muted"
            >
              {/* The API returns authenticated, runtime image URLs. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.name}
                className="h-40 w-full object-cover transition-transform group-hover:scale-105"
              />
              <span
                className={`absolute start-3 top-3 rounded-lg px-3 py-1 text-xs font-semibold text-white ${isBefore ? "bg-success" : "bg-orange-500"}`}
              >
                {isBefore ? t("before") : t("after")}
              </span>
            </a>
          );
        })}
      </div>
      {files.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {files.map((file) => {
            const kind = `${file.field} ${file.collection}`.toLowerCase();
            const isBefore = kind.includes("before");
            return (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl border bg-muted/20 p-4 hover:bg-muted/40"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{file.file_name}</span>
                  <span className="text-xs text-muted-foreground">{file.mime_type}</span>
                </span>
                <span className={`shrink-0 rounded-lg px-3 py-1 text-xs font-semibold text-white ${isBefore ? "bg-success" : "bg-orange-500"}`}>
                  {isBefore ? t("before") : t("after")}
                </span>
              </a>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function ProductEvidence({ products }: { products: CompanyTaskProduct[] }) {
  const t = useTranslations("dashboard.executionDetails");
  const rows = products.map((item) => ({
    item,
    details: Array.isArray(item.product_details) ? {} : item.product_details,
  }));
  const columns = [...new Set(rows.flatMap(({ details }) => Object.keys(details)))];
  if (!rows.length) return null;

  return (
    <section className="space-y-3">
      <h4 className="text-lg font-semibold">{t("proof")}</h4>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[42rem] text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start">{t("product")}</th>
              <th className="px-4 py-3 text-start">{t("sku")}</th>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-center">{labelize(column)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, details }) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product.image} alt="" className="size-9 rounded object-cover" />
                    ) : null}
                    <span className="font-medium">{item.product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{item.product.sku}</td>
                {columns.map((column) => (
                  <td key={column} className="px-4 py-3 text-center text-primary">
                    {valueText(details[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SubmissionFields({
  submission,
  excluded,
}: {
  submission: Record<string, unknown>;
  excluded: string[];
}) {
  const fields = Object.entries(submission).filter(
    ([key, value]) => !excluded.includes(key) && value != null && value !== "",
  );
  if (!fields.length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map(([key, value]) => (
        <div key={key} className="rounded-xl border bg-muted/20 p-4">
          <p className="text-xs text-muted-foreground">{labelize(key)}</p>
          <p className="mt-1 text-sm font-medium">{valueText(value)}</p>
        </div>
      ))}
    </div>
  );
}

function ExecutionServiceCard({
  service,
  index,
}: {
  service: CompanyTaskService;
  index: number;
}) {
  const t = useTranslations("dashboard.executionDetails");
  const locale = useLocale();
  const [expanded, setExpanded] = useState(index === 0);
  const submission = service.submission;
  const formData = submission?.form_data ?? {};
  const attachments = [...new Map(
    [...service.attachments, ...(submission?.attachments ?? [])]
      .map((attachment) => [attachment.id, attachment]),
  ).values()];
  const noteKey = ["additional_notes", "merchandiser_note", "notes", "note"].find(
    (key) => typeof formData[key] === "string",
  );
  const note = noteKey ? String(formData[noteKey]) : "";
  const completionAt = submission?.completed_at ?? service.completed_at;
  const hasEvidence = Boolean(
    note || attachments.length || service.products.length || Object.keys(formData).length,
  );

  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      <button
        type="button"
        className="group flex min-h-20 w-full items-center justify-between gap-4 bg-muted/20 px-4 py-3 text-start transition-colors hover:bg-muted/40 sm:px-5"
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="min-w-0">
          <span className="block text-xs font-medium text-muted-foreground">
            {t("serviceNumber", { number: index + 1 })}
          </span>
          <strong className="mt-1 block truncate text-base font-semibold text-foreground sm:text-lg">
            {service.service.name}
          </strong>
        </span>
        <span className="flex shrink-0 items-center gap-2 sm:gap-4">
          {completionAt ? (
            <span className="hidden items-center gap-2.5 sm:flex">
              <span className="flex size-9 items-center justify-center rounded-full bg-success/10 text-success">
                <CalendarIcon className="size-4" />
              </span>
              <span className="text-end">
                <span className="block text-xs text-muted-foreground">{t("completedAt")}</span>
                <span className="block whitespace-nowrap text-sm font-semibold text-foreground">
                  {formatDate(completionAt, locale)}
                </span>
              </span>
            </span>
          ) : null}
          <span className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground" aria-hidden="true">
            <SidebarChevronIcon className={`size-5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </span>
        </span>
      </button>
      {expanded ? (
        <div className="space-y-5 p-4 sm:p-5">
          {note ? (
            <div className="rounded-xl border border-primary/15 bg-primary/10 p-4">
              <p className="font-medium">{t("merchandiserNote")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{note}</p>
            </div>
          ) : null}
          <SubmissionFields submission={formData} excluded={noteKey ? [noteKey] : []} />
          <AttachmentEvidence attachments={attachments} />
          <ProductEvidence products={service.products} />
          {!hasEvidence ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              {t("noEvidence")}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 w-full rounded-xl border bg-background p-3 font-normal"
      />
    </label>
  );
}

function FeedbackDialog({
  open,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  pending: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const t = useTranslations("dashboard.executionDetails.feedback");
  const [platform, setPlatform] = useState("");
  const [worker, setWorker] = useState("");
  const [comments, setComments] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <section role="dialog" aria-modal="true" className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-card p-6 shadow-xl sm:p-8">
        <h2 className="text-center text-2xl font-bold">{t("title")}</h2>
        <p className="mt-2 text-center text-muted-foreground">{t("subtitle")}</p>
        <div className="mt-7 space-y-5">
          <TextArea label={t("platform")} value={platform} onChange={setPlatform} />
          <TextArea label={t("worker")} value={worker} onChange={setWorker} />
          <TextArea label={t("comments")} value={comments} onChange={setComments} />
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button variant="outline" onClick={onClose} disabled={pending}>{t("cancel")}</Button>
          <Button
            className="text-white"
            disabled={pending || !platform.trim() || !worker.trim()}
            onClick={() => onSubmit({
              platform_feedback: platform.trim(),
              worker_feedback: worker.trim(),
              additional_comments: comments.trim(),
            })}
          >
            {t("submit")}
          </Button>
        </div>
      </section>
    </div>
  );
}

function RejectDialog({
  open,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  pending: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
}) {
  const t = useTranslations("dashboard.executionDetails.reject");
  const [reason, setReason] = useState<(typeof rejectionReasons)[number]>("poorExecution");
  const [details, setDetails] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <section role="dialog" aria-modal="true" className="w-full max-w-3xl rounded-[2rem] bg-card p-6 shadow-xl sm:p-8">
        <h2 className="text-center text-2xl font-bold">{t("title")}</h2>
        <p className="mt-7 font-semibold">{t("reason")}</p>
        <p className="text-sm text-muted-foreground">{t("hint")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {rejectionReasons.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setReason(item)}
              className={`rounded-lg border px-3 py-2 text-sm ${reason === item ? "border-destructive bg-destructive/5 font-semibold text-destructive" : "border-transparent bg-muted"}`}
            >
              {t(`reasons.${item}`)}
            </button>
          ))}
        </div>
        <textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder={t("details")}
          className="mt-4 min-h-32 w-full rounded-xl border bg-background p-3"
        />
        {error ? <p role="alert" className="mt-2 text-sm text-destructive">{error}</p> : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button variant="outline" onClick={onClose} disabled={pending}>{t("cancel")}</Button>
          <Button
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={pending}
            onClick={() => onSubmit(t(`reasons.${reason}`), details.trim())}
          >
            {t("confirm")}
          </Button>
        </div>
      </section>
    </div>
  );
}

function ExecutionDetailsView({ task }: { task: CompanyTask }) {
  const t = useTranslations("dashboard.executionDetails");
  const locale = useLocale();
  const router = useRouter();
  const canEdit = usePermission("edit_task");
  const { act } = useTaskMutations();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const actionError = act.isError ? normalizeApiError(act.error).message : undefined;
  const latestServiceCompletion = task.services
    .map((service) => service.submission?.completed_at ?? service.completed_at)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => (parseDate(right)?.getTime() ?? 0) - (parseDate(left)?.getTime() ?? 0))[0];
  const finishedAt = task.completed_at ?? latestServiceCompletion ?? task.updated_at;
  const statusLabel = task.status === "completed" ? t("statuses.completed") : task.status_label;
  const headerItems = [
    { icon: WarningIcon, label: t("executedBy"), value: task.assigned_worker?.name ?? "—" },
    { icon: CalendarIcon, label: t("startedAt"), value: formatDate(task.started_at, locale) },
    { icon: CalendarIcon, label: t("finishedAt"), value: formatDate(finishedAt, locale) },
    { icon: ClockIcon, label: t("duration"), value: formatDuration(task.started_at, finishedAt) },
  ];
  const accept = (payload?: Record<string, unknown>) =>
    act.mutate(
      { id: task.id, action: "accept", payload },
      { onSuccess: () => setFeedbackOpen(false) },
    );

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <header className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="size-12 rounded-full bg-card shadow-sm" onClick={() => router.back()}>
          <BackChevronIcon className="size-6 rtl:rotate-180" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{t("title", { id: `REQ-${task.id}` })}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
      </header>

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <strong className="text-2xl">REQ-{task.id}</strong>
            <StatusBadge status={badgeStatus(task.status)} label={statusLabel} />
          </div>
          <div className="text-end text-sm">
            <span className="block font-medium">{t("servicesDone")}</span>
            <span className="text-success">{task.progress.completed_services}/{task.progress.total_services}</span>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {headerItems.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10"><Icon className="size-4 text-primary" /></span>
              <span><span className="block text-xs text-muted-foreground">{label}</span><strong className="text-sm">{value}</strong></span>
            </div>
          ))}
        </div>
      </section>

      {task.status === "rejected" && task.rejection_reason ? (
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-destructive">{task.rejection_reason}</div>
      ) : null}

      <section className="space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <h2 className="text-xl font-bold">{t("services", { count: task.services.length })}</h2>
        {task.services.map((service, index) => <ExecutionServiceCard key={service.id} service={service} index={index} />)}
      </section>

      {canEdit && task.status === "completed" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Button className="h-12 bg-destructive text-white hover:bg-destructive/90" onClick={() => { act.reset(); setRejectOpen(true); }}>{t("actions.reject")}</Button>
          <Button className="h-12 text-white" onClick={() => { act.reset(); setFeedbackOpen(true); }}>{t("actions.accept")}</Button>
        </div>
      ) : null}

      {canEdit && task.status === "rejected" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Button className="h-12 text-white" disabled={act.isPending} onClick={() => accept()}>{t("actions.reverseAccept")}</Button>
          <Button asChild variant="outline" className="h-12"><a href="mailto:support@shelfspots.com"><ViewIcon className="size-4" />{t("actions.contact")}</a></Button>
        </div>
      ) : null}
      {task.status === "rejected" && actionError ? <p role="alert" className="text-sm text-destructive">{actionError}</p> : null}

      <RejectDialog
        open={rejectOpen}
        pending={act.isPending}
        error={actionError}
        onClose={() => setRejectOpen(false)}
        onSubmit={(reason, details) => act.mutate(
          { id: task.id, action: "reject", payload: { reason, rejection_reason: reason, details } },
          { onSuccess: () => setRejectOpen(false) },
        )}
      />
      <FeedbackDialog
        open={feedbackOpen}
        pending={act.isPending}
        error={actionError}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={accept}
      />
    </div>
  );
}

export function ExecutionDetailsPage({ id }: { id: string | number }) {
  const t = useTranslations("dashboard.executionDetails");
  const query = useTaskQuery(id);
  if (query.isPending) return <PageLoadingSkeleton actionCount={2} cardCount={2} tableRows={4} tableColumns={4} />;
  if (query.isError || !query.data?.data) {
    return <ErrorState className="m-8" title={t("errorTitle")} description={t("errorDescription")} retryLabel={t("retry")} onRetry={() => void query.refetch()} />;
  }
  return <ExecutionDetailsView task={query.data.data} />;
}
