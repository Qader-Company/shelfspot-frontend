"use client";

import { useState } from "react";
import Image from "next/image";

import {
  BoxIcon,
  ClockIcon,
  CostIcon,
  DownloadIcon,
  SidebarChevronIcon,
  SidebarChevronUpIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { StatusBadge } from "@/shared/components/dashboard/status-badge";
import type { StatusBadgeStatus } from "@/shared/components/dashboard/status-badge";
import { cn } from "@/shared/lib/utils";

import type { CompanyTaskService } from "./types";

// ─── Pill colours for Brand / Sub-Brand / Category / Sub-Category ────────

const pillStyles = {
  brand:       "bg-[var(--info-50)] text-[var(--info-700)]",
  subBrand:    "bg-[var(--warning-100,#ffedd5)] text-[var(--warning-700)]",
  category:    "bg-[var(--success-50)] text-[var(--success-700)]",
  subCategory: "bg-purple-50 text-purple-700",
} as const;

// Map backend status strings → StatusBadge variant
function toStatusBadge(status: string): StatusBadgeStatus {
  if (status === "in_progress") return "inProgress";
  if (status === "in_review")   return "inReview";
  const known: StatusBadgeStatus[] = [
    "pending","accepted","completed","failed","rejected","canceled","reopened","active","inactive","refunded",
  ];
  return known.includes(status as StatusBadgeStatus) ? (status as StatusBadgeStatus) : "pending";
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface ServiceCardLabels {
  productHeading: string;
  products: string;
  skuCode: string;
  minQuantity: string;
  executionGuidelines: string;
  attachments: string;
  brand: string;
  subBrand: string;
  category: string;
  subCategory: string;
  noProducts: string;
  download: string;
}

interface ServiceDetailCardProps {
  service: CompanyTaskService;
  labels: ServiceCardLabels;
  index: number;
  defaultExpanded?: boolean;
}

export function ServiceDetailCard({
  service,
  labels,
  index,
  defaultExpanded = true,
}: ServiceDetailCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const ChevronIcon = isExpanded ? SidebarChevronUpIcon : SidebarChevronIcon;

  // Collect taxonomy pills from the first product that has them
  const firstProduct = service.products[0]?.product;
  const brand       = firstProduct?.brand?.name       ?? null;
  const subBrand    = firstProduct?.sub_brand?.name   ?? null;
  const category    = firstProduct?.category?.name    ?? null;
  const subCategory = firstProduct?.sub_category?.name ?? null;
  const hasTaxonomy = brand || subBrand || category || subCategory;

  const pills = [
    { key: "brand",       label: labels.brand,       value: brand,       style: pillStyles.brand       },
    { key: "subBrand",    label: labels.subBrand,    value: subBrand,    style: pillStyles.subBrand    },
    { key: "category",    label: labels.category,    value: category,    style: pillStyles.category    },
    { key: "subCategory", label: labels.subCategory, value: subCategory, style: pillStyles.subCategory },
  ].filter((p) => p.value);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Card header */}
      <button
        type="button"
        className="flex w-full items-center justify-between px-5 py-4 text-start"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {`#${index + 1}`}
          </p>
          <p className="mt-0.5 text-base font-bold text-foreground">
            {service.service.name}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {/* Unit cost */}
          <span className="flex items-center gap-1 text-sm font-semibold text-success">
            <CostIcon className="size-4" />
            {service.unit_price} SAR
          </span>
          {/* Status */}
          <StatusBadge
            status={toStatusBadge(service.status)}
            label={service.status_label}
          />
          <ChevronIcon className="size-4 text-muted-foreground" />
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="space-y-5 border-t border-border px-5 pb-5 pt-4">

          {/* Taxonomy pills */}
          {hasTaxonomy && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {pills.map(({ key, label, value, style }) => (
                <div key={key} className={cn("rounded-lg px-4 py-3", style)}>
                  <p className="text-xs font-medium opacity-70">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Products table */}
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">
              {labels.productHeading}
              {service.products.length > 0 && (
                <span className="ms-1 text-muted-foreground">
                  ({service.products.length})
                </span>
              )}
            </p>

            {service.products.length === 0 ? (
              <p className="text-sm text-muted-foreground">{labels.noProducts}</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr className="text-xs font-medium text-muted-foreground">
                      <th className="border-b border-e border-border px-4 py-3 text-start">
                        {labels.products}
                      </th>
                      <th className="border-b border-e border-border px-4 py-3 text-start">
                        {labels.skuCode}
                      </th>
                      <th className="border-b border-border px-4 py-3 text-start">
                        {labels.minQuantity}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.products.map((p, i) => {
                      const details = Array.isArray(p.product_details) ? {} : p.product_details;
                      const minQty = details.minimum_quantity ?? "—";
                      const img = p.product.image;
                      return (
                        <tr key={`${p.id}-${i}`}>
                          <td className="border-b border-border px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-muted">
                                {img ? (
                                  <Image
                                    src={img}
                                    alt={p.product.name}
                                    width={36}
                                    height={36}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <BoxIcon className="size-5 text-muted-foreground" />
                                )}
                              </span>
                              <span className="font-medium text-foreground">
                                {p.product.name}
                              </span>
                            </div>
                          </td>
                          <td className="border-b border-border px-4 py-3 text-muted-foreground">
                            {p.product.sku}
                          </td>
                          <td className="border-b border-border px-4 py-3 text-muted-foreground">
                            {String(minQty)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Execution instructions */}
          {service.execution_instructions && (
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">
                {labels.executionGuidelines}
              </p>
              <p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground">
                {service.execution_instructions}
              </p>
            </div>
          )}

          {/* Attachments */}
          {service.attachments.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">
                {labels.attachments}
              </p>
              <div className="space-y-2">
                {service.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded border border-border bg-card">
                        {att.mime_type.startsWith("image/") ? (
                          <Image
                            src={att.url}
                            alt={att.name}
                            width={36}
                            height={36}
                            className="h-full w-full rounded object-cover"
                          />
                        ) : (
                          <BoxIcon className="size-5 text-primary" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {att.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(att.size)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={labels.download}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <DownloadIcon className="size-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service description */}
          {service.service.description && (
            <p className="text-xs text-muted-foreground">
              {service.service.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
