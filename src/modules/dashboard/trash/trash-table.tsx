import type { TrashRow } from "./trash.seed";
import { CategoryPath } from "./category-path";
import { ProductCell } from "./product-cell";
import { RowActions } from "./row-actions";
import { StatusToggle } from "@/shared/components/dashboard/status-toggle";

interface TrashTableLabels {
  products: string;
  family: string;
  sku: string;
  description: string;
  status: string;
  deletedDate: string;
  action: string;
  selectAll: string;
  selectRow: string;
  deleteRow: string;
  restoreRow: string;
  toggleStatus: string;
}

interface TrashTableProps {
  rows: TrashRow[];
  labels: TrashTableLabels;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

export function TrashTable({ rows, labels, onDelete, onRestore }: TrashTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-separate border-spacing-0 text-start">
          <thead>
            <tr className="text-xs font-medium text-foreground">
              {/* Checkbox */}
              <th className="w-12 border-b border-e border-border px-5 py-3 text-start">
                <span className="sr-only">{labels.selectAll}</span>
                <span className="block size-4 rounded border border-border bg-card" />
              </th>
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.products}
              </th>
              <th className="border-b border-e border-border px-7 py-3 text-start">
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
                {labels.deletedDate}
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
                <td className="border-b border-border px-5 py-4">
                  <span className="sr-only">{labels.selectRow}</span>
                  <span className="block size-4 rounded border border-border bg-card" />
                </td>

                {/* Product thumbnail + name */}
                <td className="border-b border-border px-5 py-3">
                  <ProductCell
                    name={row.productName}
                    thumbnailAlt={row.thumbnailAlt}
                  />
                </td>

                {/* Breadcrumb path */}
                <td className="border-b border-border px-7 py-4">
                  <CategoryPath segments={row.pathSegments} />
                </td>

                {/* SKU */}
                <td className="border-b border-border px-5 py-4 text-muted-foreground">
                  {row.sku}
                </td>

                {/* Description */}
                <td className="border-b border-border px-5 py-4 text-muted-foreground">
                  {row.description}
                </td>

                {/* Status toggle */}
                <td className="border-b border-border px-5 py-4">
                  <StatusToggle
                    isActive={row.isActive}
                    ariaLabel={labels.toggleStatus}
                  />
                </td>

                {/* Deleted date */}
                <td className="border-b border-border px-5 py-4 text-muted-foreground">
                  {row.deletedDate}
                </td>

                {/* Row actions */}
                <td className="border-b border-border px-5 py-4">
                  <RowActions
                    deleteLabel={labels.deleteRow}
                    restoreLabel={labels.restoreRow}
                    onDelete={() => onDelete(row.id)}
                    onRestore={() => onRestore(row.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
