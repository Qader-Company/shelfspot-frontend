import { StatusToggle } from "@/shared/components/dashboard/status-toggle";
import {
  EditIcon,
  TrashIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { Button } from "@/shared/ui/button";
import { usePermission } from "@/shared/components/auth/permission-provider";

import type { RoleRow } from "./admins.seed";

interface RolesTableLabels {
  roleName: string;
  numberOfUsers: string;
  status: string;
  action: string;
  toggleStatus: string;
  delete: string;
  edit: string;
}

interface RolesTableProps {
  rows: RoleRow[];
  labels: RolesTableLabels;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function RolesTable({
  rows,
  labels,
  onDelete,
  onEdit,
}: RolesTableProps) {
  const canEdit = usePermission("edit_role");
  const canDelete = usePermission("delete_role");
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-0 text-start">
          <thead>
            <tr className="text-xs font-medium text-foreground">
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.roleName}
              </th>
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.numberOfUsers}
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
                <td className="border-b border-border px-5 py-4 font-semibold text-foreground">
                  {row.name}
                </td>
                <td className="border-b border-border px-5 py-4 text-muted-foreground">
                  {row.userCount}
                </td>
                <td className="border-b border-border px-5 py-4">
                  <StatusToggle
                    isActive={row.isActive}
                    ariaLabel={labels.toggleStatus}
                  />
                </td>
                <td className="border-b border-border px-5 py-4">
                  <div className="flex items-center gap-3">
                    {canDelete && !row.isProtected ? <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={labels.delete}
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(row.id)}
                    >
                      <TrashIcon className="size-4" />
                    </Button> : null}
                    {canEdit && !row.isProtected ? <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={labels.edit}
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(row.id)}
                    >
                      <EditIcon className="size-4" />
                    </Button> : null}
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
