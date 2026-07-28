import { Link } from "@/i18n/navigation";
import type { DashboardRequestRow } from "@/modules/company/requests/list/types";
import { StatusBadge } from "@/shared/components/dashboard/status-badge";
import { EditIcon, TrashIcon } from "@/shared/components/dashboard/dashboard-icons";
import { Button } from "@/shared/ui/button";

interface DashboardRequestsTableProps {
  rows: DashboardRequestRow[];
  labels: {
    requestId: string;
    location: string;
    assignedBy: string;
    time: string;
    status: string;
    action: string;
    selectAll: string;
    selectRow: string;
    delete: string;
    edit: string;
  };
  resolveStatus: (status: DashboardRequestRow["status"]) => string;
  onDelete?: (id: string) => void;
}

export function DashboardRequestsTable({
  rows,
  labels,
  resolveStatus,
  onDelete,
}: DashboardRequestsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-separate border-spacing-0 text-start">
          <thead>
            <tr className="text-xs font-medium text-foreground">
              <th className="w-12 border-b border-e border-border px-5 py-3 text-start">
                <span className="sr-only">{labels.selectAll}</span>
                <span className="block size-4 rounded border border-border bg-card" />
              </th>
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.requestId}
              </th>
              <th className="border-b border-e border-border px-7 py-3 text-start">
                {labels.location}
              </th>
              <th className="border-b border-e border-border px-7 py-3 text-start">
                {labels.assignedBy}
              </th>
              <th className="border-b border-e border-border px-7 py-3 text-start">
                {labels.time}
              </th>
              <th className="border-b border-e border-border px-7 py-3 text-start">
                {labels.status}
              </th>
              <th className="border-b border-border px-7 py-3 text-start">
                {labels.action}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.id}-${row.status}-${index}`} className="text-sm">
                <td className="border-b border-border px-5 py-4">
                  <span className="sr-only">{labels.selectRow}</span>
                  <span className="block size-4 rounded border border-border bg-card" />
                </td>
                <td className="border-b border-border px-5 py-4 font-semibold text-foreground">
                  <Link
                    href={`/dashboard/requests/${row.taskId ?? row.id}`}
                    className="text-primary hover:underline"
                  >
                    {row.id}
                  </Link>
                </td>
                <td className="border-b border-border px-7 py-4 text-muted-foreground">
                  {row.location}
                </td>
                <td className="border-b border-border px-7 py-4 text-muted-foreground">
                  {row.assignee}
                </td>
                <td className="border-b border-border px-7 py-4 text-muted-foreground">
                  {row.time}
                </td>
                <td className="border-b border-border px-7 py-4">
                  <StatusBadge status={row.status} label={row.statusLabel ?? resolveStatus(row.status)} />
                </td>
                <td className="border-b border-border px-7 py-4">
                  <div className="flex items-center gap-3">
                    <Button
                      aria-label={labels.delete}
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete?.(String(row.taskId ?? row.id))}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                    {row.canEdit ? (
                      <Button asChild aria-label={labels.edit} variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground">
                        <Link href={`/dashboard/requests/${row.taskId ?? row.id}/edit`}><EditIcon className="size-4" /></Link>
                      </Button>
                    ) : null}
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
