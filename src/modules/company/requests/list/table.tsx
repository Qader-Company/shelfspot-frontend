import { Link } from "@/i18n/navigation";
import type { DashboardRequestRow } from "@/modules/company/requests/list/types";
import { StatusBadge } from "@/shared/components/dashboard/status-badge";
import { EditIcon, TrashIcon } from "@/shared/components/dashboard/dashboard-icons";
import { Button } from "@/shared/ui/button";
import { usePermission } from "@/shared/components/auth/permission-provider";

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
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  disabled?: boolean;
}

export function DashboardRequestsTable({
  rows,
  labels,
  resolveStatus,
  onDelete,
  selectedIds = [],
  onSelectionChange,
  disabled = false,
}: DashboardRequestsTableProps) {
  const canEdit = usePermission("edit_task");
  const canDelete = usePermission("delete_task");
  const ids = rows.map((row) => String(row.taskId ?? row.id));
  const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
  const someSelected = ids.some((id) => selectedIds.includes(id));
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-separate border-spacing-0 text-start">
          <thead>
            <tr className="text-xs font-medium text-foreground">
              <th className="w-12 border-b border-e border-border px-5 py-3 text-start">
                {canDelete && onSelectionChange ? <input type="checkbox" aria-label={labels.selectAll} className="size-[18px] accent-primary" disabled={disabled} checked={allSelected} ref={(input) => { if (input) input.indeterminate = someSelected && !allSelected; }} onChange={() => onSelectionChange(allSelected ? selectedIds.filter((id) => !ids.includes(id)) : Array.from(new Set([...selectedIds, ...ids])))} /> : null}
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
              <tr key={`${row.id}-${row.status}-${index}`} className="text-sm transition-colors hover:bg-muted/40 data-[selected=true]:bg-primary/5" data-selected={selectedIds.includes(String(row.taskId ?? row.id))}>
                <td className="border-b border-border px-5 py-4">
                  {canDelete && onSelectionChange ? <input type="checkbox" aria-label={`${labels.selectRow} ${row.id}`} className="size-[18px] accent-primary" disabled={disabled} checked={selectedIds.includes(String(row.taskId ?? row.id))} onChange={(event) => { const id = String(row.taskId ?? row.id); onSelectionChange(event.target.checked ? [...selectedIds, id] : selectedIds.filter((selected) => selected !== id)); }} /> : null}
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
                    {canDelete ? <Button
                      aria-label={labels.delete}
                      disabled={disabled}
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete?.(String(row.taskId ?? row.id))}
                    >
                      <TrashIcon className="size-4" />
                    </Button> : null}
                    {canEdit && row.canEdit ? (
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
