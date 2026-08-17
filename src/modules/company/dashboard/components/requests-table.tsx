import type { RequestTableRow } from "@/modules/company/dashboard/components/dashboard-overview.seed";
import { requestActions } from "@/modules/company/dashboard/components/dashboard-overview.seed";
import { StatusBadge } from "@/shared/components/dashboard/status-badge";
import { Button } from "@/shared/ui/button";

interface RequestsTableProps {
  rows: RequestTableRow[];
  labels: {
    title: string;
    requestId: string;
    location: string;
    assignedBy: string;
    time: string;
    status: string;
    action: string;
    delete: string;
    edit: string;
  };
  resolveText: (key: string) => string;
  resolveStatus: (status: RequestTableRow["status"]) => string;
}

export function RequestsTable({
  rows,
  labels,
  resolveText,
  resolveStatus,
}: RequestsTableProps) {
  const DeleteIcon = requestActions.delete;
  const EditIcon = requestActions.edit;

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-4 sm:px-7 sm:py-5">
        <h2 className="text-xl leading-none font-bold text-foreground sm:text-3xl">
          {labels.title}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-0 text-start">
          <thead>
            <tr className="text-xs font-medium text-foreground">
              <th className="border-b border-e border-border px-7 py-4 text-start">
                {labels.requestId}
              </th>
              <th className="border-b border-e border-border px-7 py-4 text-start">
                {labels.location}
              </th>
              <th className="border-b border-e border-border px-7 py-4 text-start">
                {labels.assignedBy}
              </th>
              <th className="border-b border-e border-border px-7 py-4 text-start">
                {labels.time}
              </th>
              <th className="border-b border-e border-border px-7 py-4 text-start">
                {labels.status}
              </th>
              <th className="border-b border-border px-7 py-4 text-start">
                {labels.action}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.id}-${row.status}-${index}`} className="text-sm">
                <td className="border-b border-border px-7 py-5 font-semibold text-foreground">
                  {row.id}
                </td>
                <td className="border-b border-border px-7 py-5 text-muted-foreground">
                  {resolveText(row.locationKey)}
                </td>
                <td className="border-b border-border px-7 py-5 text-muted-foreground">
                  {resolveText(row.assigneeKey)}
                </td>
                <td className="border-b border-border px-7 py-5 text-muted-foreground">
                  {row.time}
                </td>
                <td className="border-b border-border px-7 py-5">
                  <StatusBadge status={row.status} label={resolveStatus(row.status)} />
                </td>
                <td className="border-b border-border px-7 py-5">
                  <div className="flex items-center gap-3">
                    <Button
                      aria-label={labels.delete}
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <DeleteIcon className="size-4" />
                    </Button>
                    <Button
                      aria-label={labels.edit}
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-foreground"
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
    </section>
  );
}
