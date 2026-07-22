"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useUpdateCatalogStatusMutation } from "@/modules/company/catalog/shared/use-update-status-mutation";
import type { CatalogStatusResource } from "@/modules/company/catalog/shared/update-status-service";
import { normalizeApiError } from "@/shared/lib/api/errors";

import { StatusBadge } from "@/shared/components/dashboard/status-badge";
import {
  EditIcon,
  TrashIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { StatusToggle } from "@/shared/components/dashboard/status-toggle";
import { Button } from "@/shared/ui/button";

// Reuse ProductCell and CategoryPath from Trash — same visual design
import { ProductCell } from "@/modules/company/catalog/products/cell";
import { CategoryPath } from "@/modules/company/catalog/products/category-path";

import type { ProductRow } from "@/modules/company/catalog/shared/seed";

interface CatalogProductTableLabels {
  products: string;
  family: string;
  sku: string;
  description: string;
  status: string;
  createdDate: string;
  action: string;
  selectAll: string;
  selectRow: string;
  delete: string;
  edit: string;
  toggleStatus: string;
  activeLabel: string;
  inactiveLabel: string;
  loading: string;
  empty: string;
}

interface CatalogProductTableProps {
  rows: ProductRow[];
  labels: CatalogProductTableLabels;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onToggleStatus?: (id: string, isActive: boolean) => void;
  statusResource?: CatalogStatusResource;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  isLoading?: boolean;
}

export function CatalogProductTable({
  rows,
  labels,
  onDelete,
  onEdit,
  onToggleStatus,
  statusResource,
  selectedIds = [],
  onSelectionChange,
  isLoading = false,
}: CatalogProductTableProps) {
  const queryClient = useQueryClient();
  const statusMutation = useUpdateCatalogStatusMutation();
  const [statusError, setStatusError] = useState("");
  const resolvedResource = statusResource ?? "products";
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));
  async function toggleStatus(id: string, isActive: boolean) {
    if (onToggleStatus) return onToggleStatus(id, isActive);
    if (!resolvedResource) return;
    setStatusError("");
    try { await statusMutation.mutateAsync({ resource: resolvedResource, id, isActive }); await queryClient.invalidateQueries({ queryKey: ["app", resolvedResource] }); }
    catch (error) { setStatusError(normalizeApiError(error).message); }
  }
  return (
    <div className="space-y-3">{statusError ? <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">{statusError}</p> : null}<div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-separate border-spacing-0 text-start">
          <thead>
            <tr className="text-xs font-medium text-foreground">
              <th className="w-10 border-b border-e border-border px-4 py-3 text-start">
                <span className="sr-only">{labels.selectAll}</span>
                <input type="checkbox" checked={allSelected} onChange={() => onSelectionChange?.(allSelected ? selectedIds.filter((id) => !rows.some((row) => row.id === id)) : Array.from(new Set([...selectedIds, ...rows.map((row) => row.id)])))} />
              </th>
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.products}
              </th>
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.family}
              </th>
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.sku}
              </th>
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.description}
              </th>
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.status}
              </th>
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.createdDate}
              </th>
              <th className="border-b border-border px-5 py-3 text-start">
                {labels.action}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading || rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="h-40 border-b border-border px-5 text-center text-sm text-muted-foreground"
                  role="status"
                >
                  {isLoading ? labels.loading : labels.empty}
                </td>
              </tr>
            ) : null}
            {rows.map((row, index) => (
              <tr key={`${row.id}-${index}`} className="text-sm">
                <td className="border-b border-border px-4 py-4">
                  <span className="sr-only">{labels.selectRow}</span>
                  <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => onSelectionChange?.(selectedIds.includes(row.id) ? selectedIds.filter((id) => id !== row.id) : [...selectedIds, row.id])} />
                </td>

                <td className="border-b border-border px-5 py-3">
                  <ProductCell
                    name={row.name}
                    thumbnailAlt={row.thumbnailAlt}
                    thumbnailUrl={row.thumbnailUrl}
                  />
                </td>

                <td className="border-b border-border px-5 py-4">
                  <CategoryPath segments={row.pathSegments} />
                </td>

                <td className="border-b border-border px-5 py-4 text-muted-foreground">
                  {row.sku}
                </td>

                <td className="border-b border-border px-5 py-4 text-muted-foreground">
                  {row.description}
                </td>

                <td className="border-b border-border px-5 py-4">
                  {row.statusDisplay === "badge" && row.badgeStatus ? (
                    <StatusBadge
                      status={row.badgeStatus}
                      label={
                        row.badgeStatus === "active"
                          ? labels.activeLabel
                          : labels.inactiveLabel
                      }
                    />
                  ) : (
                    <button
                      type="button"
                      className="rounded-full"
                      onClick={() => toggleStatus(row.id, !row.isActive)}
                      disabled={(!onToggleStatus && !resolvedResource) || statusMutation.isPending}
                    >
                      <StatusToggle
                        isActive={row.isActive}
                        ariaLabel={labels.toggleStatus}
                      />
                    </button>
                  )}
                </td>

                <td className="border-b border-border px-5 py-4 text-muted-foreground">
                  {row.createdDate}
                </td>

                <td className="border-b border-border px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={labels.delete}
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(row.id)}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={labels.edit}
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(row.id)}
                    >
                      <EditIcon className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div></div>
  );
}
