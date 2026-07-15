import { StatusBadge } from "@/modules/dashboard/components/status-badge";
import { RestoreIcon, TrashIcon } from "@/shared/components/dashboard/dashboard-icons";
import { Button } from "@/shared/ui/button";

import type { TrashRequestRow } from "@/modules/dashboard/requests/request-details.seed";

interface TrashRequestsTableLabels {
  requestId: string;
  location: string;
  assignedBy: string;
  deletedAt: string;
  status: string;
  action: string;
  selectAll: string;
  selectRow: string;
  deleteRow: string;
  restoreRow: string;
}

interface TrashRequestsTableProps {
  rows: TrashRequestRow[];
  labels: TrashRequestsTableLabels;
  resolveStatus: (status: TrashRequestRow["status"]) => string;
  onDelete: () => void;
  onRestore: () => void;
}

export function TrashRequestsTable({
  rows,
  labels,
  resolveStatus,
  onDelete,
  onRestore,
}: TrashRequestsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-separate border-spacing-0 text-start">
          <thead>
            <tr className="text-xs font-medium text-foreground">
              <th className="w-12 border-b border-e border-border px-5 py-3 text-start">
                <span className="sr-only">{labels.selectAll}</span>
                <span className="block size-4 rounded border border-border bg-card" />
              </th>
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.requestId}
              </th>
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.location}
              </th>
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.assignedBy}
              </th>
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.deletedAt}
              </th>
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.status}
              </th>
              <th className="border-b border-border px-5 py-3 text-start">
                {labels.action}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.id}-${index}`} className="text-sm">
                <td className="border-b border-border px-5 py-4">
                  <span className="sr-only">{labels.selectRow}</span>
                  <span className="block size-4 rounded border border-border bg-card" />
                </td>
                <td className="border-b border-border px-5 py-4 font-semibold text-foreground">
                  {row.requestId}
                </td>
                <td className="border-b border-border px-5 py-4 text-muted-foreground">
                  {row.location}
                </td>
                <td className="border-b border-border px-5 py-4 text-muted-foreground">
                  {row.assignedBy}
                </td>
                <td className="border-b border-border px-5 py-4 text-muted-foreground">
                  {row.deletedAt}
                </td>
                <td className="border-b border-border px-5 py-4">
                  <StatusBadge
                    status={row.status}
                    label={resolveStatus(row.status)}
                  />
                </td>
                <td className="border-b border-border px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={labels.deleteRow}
                      className="text-muted-foreground hover:text-destructive"
                      onClick={onDelete}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={labels.restoreRow}
                      className="text-muted-foreground hover:text-foreground"
                      onClick={onRestore}
                    >
                      <RestoreIcon className="size-4" />
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
