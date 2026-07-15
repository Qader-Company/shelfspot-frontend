import { StatusBadge } from "@/modules/dashboard/components/status-badge";
import {
  EditIcon,
  TrashIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { StatusToggle } from "@/shared/components/dashboard/status-toggle";
import { Button } from "@/shared/ui/button";

// Reuse ProductCell and CategoryPath from Trash — same visual design
import { ProductCell } from "@/modules/dashboard/trash/product-cell";
import { CategoryPath } from "@/modules/dashboard/trash/category-path";

import type { ProductRow } from "./catalog.seed";

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
}

interface CatalogProductTableProps {
  rows: ProductRow[];
  labels: CatalogProductTableLabels;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function CatalogProductTable({
  rows,
  labels,
  onDelete,
  onEdit,
}: CatalogProductTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-separate border-spacing-0 text-start">
          <thead>
            <tr className="text-xs font-medium text-foreground">
              <th className="w-10 border-b border-e border-border px-4 py-3 text-start">
                <span className="sr-only">{labels.selectAll}</span>
                <span className="block size-4 rounded border border-border bg-card" />
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
            {rows.map((row, index) => (
              <tr key={`${row.id}-${index}`} className="text-sm">
                <td className="border-b border-border px-4 py-4">
                  <span className="sr-only">{labels.selectRow}</span>
                  <span className="block size-4 rounded border border-border bg-card" />
                </td>

                <td className="border-b border-border px-5 py-3">
                  <ProductCell
                    name={row.name}
                    thumbnailAlt={row.thumbnailAlt}
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
                    <StatusToggle
                      isActive={row.isActive}
                      ariaLabel={labels.toggleStatus}
                    />
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
    </div>
  );
}
