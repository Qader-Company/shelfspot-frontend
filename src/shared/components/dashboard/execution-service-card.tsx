"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ScrollableTable } from "@/shared/components/scrollable-table";
import { CalendarIcon, SidebarChevronIcon } from "@/shared/components/dashboard/dashboard-icons";
import type { CompanyTaskAttachment, CompanyTaskProduct, CompanyTaskService } from "@/modules/company/requests/details/types";

export type ExecutionServiceEvidence = Pick<CompanyTaskService, "products" | "submission" | "attachments" | "completed_at"> & { service: { name: string } };

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
      <ScrollableTable className="rounded-xl border">
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
      </ScrollableTable>
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

export function ExecutionServiceCard({
  service,
  index,
}: {
  service: ExecutionServiceEvidence;
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
        aria-expanded={expanded}
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
