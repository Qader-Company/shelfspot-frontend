"use client";

import { useState } from "react";

import {
  ClockIcon,
  CostIcon,
  SidebarChevronIcon,
  SidebarChevronUpIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { BoxIcon } from "@/shared/components/dashboard/dashboard-icons";
import { cn } from "@/shared/lib/utils";

import type { RequestService } from "./request-details.seed";

// ─── Pill colors for Brand / Sub-Brand / Category / Sub-Category ─────────

const pillStyles = {
  brand:       "bg-[var(--info-50)] text-[var(--info-700)]",
  subBrand:    "bg-[var(--warning-100,#ffedd5)] text-[var(--warning-700)]",
  category:    "bg-[var(--success-50)] text-[var(--success-700)]",
  subCategory: "bg-purple-50 text-purple-700",
} as const;

interface ServiceDetailCardProps {
  service: RequestService;
  labels: {
    productHeading: string; // e.g. "Product(3)"
    products: string;
    skuCode: string;
    quantity: string;
    expiryDate: string;
    executionGuidelines: string;
    brandLabel: string;
    subBrandLabel: string;
    categoryLabel: string;
    subCategoryLabel: string;
  };
  defaultExpanded?: boolean;
}

export function ServiceDetailCard({
  service,
  labels,
  defaultExpanded = true,
}: ServiceDetailCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const ChevronIcon = isExpanded ? SidebarChevronUpIcon : SidebarChevronIcon;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Card header */}
      <button
        type="button"
        className="flex w-full items-center justify-between px-5 py-4 text-start"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{service.label}</p>
          <p className="mt-0.5 text-base font-bold text-foreground">
            {service.name}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {/* Cost */}
          <span className="flex items-center gap-1 text-sm font-semibold text-success">
            <CostIcon className="size-4" />
            {service.cost}S
          </span>
          {/* Time */}
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <ClockIcon className="size-4 text-primary" />
            {isExpanded ? service.duration : service.timeWindow}
          </span>
          <ChevronIcon className="size-4 text-muted-foreground" />
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-5">
          {/* Brand pills */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                { labelKey: labels.brandLabel,       value: service.brand,       style: pillStyles.brand       },
                { labelKey: labels.subBrandLabel,    value: service.subBrand,    style: pillStyles.subBrand    },
                { labelKey: labels.categoryLabel,    value: service.category,    style: pillStyles.category    },
                { labelKey: labels.subCategoryLabel, value: service.subCategory, style: pillStyles.subCategory },
              ] as const
            ).map(({ labelKey, value, style }) => (
              <div
                key={labelKey}
                className={cn("rounded-lg px-4 py-3", style)}
              >
                <p className="text-xs font-medium opacity-70">{labelKey}</p>
                <p className="mt-0.5 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {/* Products table */}
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">
              {labels.productHeading}
            </p>
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
                    <th className="border-b border-e border-border px-4 py-3 text-start">
                      {labels.quantity}
                    </th>
                    <th className="border-b border-border px-4 py-3 text-start">
                      {labels.expiryDate}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {service.products.map((product, index) => (
                    <tr key={`${product.id}-${index}`}>
                      <td className="border-b border-border px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            aria-label={product.thumbnailAlt}
                            className="flex size-9 shrink-0 items-center justify-center rounded border border-border bg-muted"
                          >
                            <BoxIcon className="size-5 text-muted-foreground" />
                          </span>
                          <span className="font-medium text-foreground">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="border-b border-border px-4 py-3 text-muted-foreground">
                        {product.sku}
                      </td>
                      <td className="border-b border-border px-4 py-3 text-muted-foreground">
                        {product.quantity}
                      </td>
                      <td className="border-b border-border px-4 py-3 text-muted-foreground">
                        {product.expiryDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Execution guidelines */}
          {service.guideline && (
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">
                {labels.executionGuidelines}
              </p>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded border border-border bg-card">
                  <BoxIcon className="size-5 text-primary" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {service.guideline.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {service.guideline.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
