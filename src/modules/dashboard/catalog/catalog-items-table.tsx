"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUpdateCatalogStatusMutation } from "@/modules/dashboard/hooks/use-update-catalog-status-mutation";
import type { CatalogStatusResource } from "@/modules/dashboard/services/update-catalog-status-service";
import { normalizeApiError } from "@/shared/lib/api/errors";

import { StatusBadge } from "@/modules/dashboard/components/status-badge";
import {
  BoxIcon,
  EditIcon,
  TrashIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { StatusToggle } from "@/shared/components/dashboard/status-toggle";
import { Button } from "@/shared/ui/button";

import type { CatalogBaseRow } from "./catalog.seed";

export interface CatalogExtraColumn {
  key: string;
  header: string;
  getValue: (row: Record<string, unknown>) => string;
}

interface CatalogItemsTableLabels {
  nameColumn: string;
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
}

interface CatalogItemsTableProps {
  rows: CatalogBaseRow[];
  labels: CatalogItemsTableLabels;
  extraColumns: CatalogExtraColumn[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onToggleStatus?: (id: string, isActive: boolean) => void;
  statusResource?: CatalogStatusResource;
}

export function CatalogItemsTable({
  rows,
  labels,
  extraColumns,
  onDelete,
  onEdit,
  onToggleStatus,
  statusResource,
}: CatalogItemsTableProps) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const statusMutation = useUpdateCatalogStatusMutation();
  const [statusError, setStatusError] = useState("");
  const resolvedResource = statusResource ??
    (pathname.endsWith("/sub-brand") ? "sub-brands" :
      pathname.endsWith("/sub-category") ? "sub-categories" :
        pathname.endsWith("/category") ? "categories" :
          pathname.endsWith("/brand") ? "brands" : undefined);

  async function toggleStatus(id: string, isActive: boolean) {
    if (onToggleStatus) return onToggleStatus(id, isActive);
    if (!resolvedResource) return;
    setStatusError("");
    try {
      await statusMutation.mutateAsync({ resource: resolvedResource, id, isActive });
      await queryClient.invalidateQueries({ queryKey: ["app", resolvedResource] });
    } catch (error) {
      setStatusError(normalizeApiError(error).message);
    }
  }
  return (
    <div className="space-y-3">
      {statusError ? <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">{statusError}</p> : null}
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-separate border-spacing-0 text-start">
          <thead>
            <tr className="text-xs font-medium text-foreground">
              {/* Checkbox */}
              <th className="w-10 border-b border-e border-border px-4 py-3 text-start">
                <span className="sr-only">{labels.selectAll}</span>
                <span className="block size-4 rounded border border-border bg-card" />
              </th>
              {/* Name column */}
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.nameColumn}
              </th>
              {/* Extra columns */}
              {extraColumns.map((col) => (
                <th
                  key={col.key}
                  className="border-b border-e border-border px-5 py-3 text-start"
                >
                  {col.header}
                </th>
              ))}
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
            {rows.map((row, index) => (
              <tr key={`${row.id}-${index}`} className="text-sm">
                {/* Checkbox */}
                <td className="border-b border-border px-4 py-4">
                  <span className="sr-only">{labels.selectRow}</span>
                  <span className="block size-4 rounded border border-border bg-card" />
                </td>

                {/* Thumbnail + name */}
                <td className="border-b border-border px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-muted">
                      {row.thumbnailUrl ? (
                        // API-hosted catalog images are dynamic and may come
                        // from different configured backend hosts.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.thumbnailUrl}
                          alt={row.thumbnailAlt}
                          className="size-full object-contain"
                        />
                      ) : (
                        <BoxIcon className="size-5 text-muted-foreground" />
                      )}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {row.name}
                    </span>
                  </div>
                </td>

                {/* Extra columns */}
                {extraColumns.map((col) => (
                  <td
                    key={col.key}
                    className="border-b border-border px-5 py-4 text-muted-foreground"
                  >
                    {col.getValue(row as unknown as Record<string, unknown>)}
                  </td>
                ))}

                {/* Status */}
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

                {/* Created date */}
                <td className="border-b border-border px-5 py-4 text-muted-foreground">
                  {row.createdDate}
                </td>

                {/* Actions */}
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


