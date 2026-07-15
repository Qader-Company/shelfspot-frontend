import {
  CheckIcon,
  SidebarChevronIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { StatusToggle } from "@/shared/components/dashboard/status-toggle";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { availableRoles, permissionItems } from "./admins.seed";

interface RoleFormDialogProps {
  isOpen: boolean;
  labels: {
    title: string;
    activation: string;
    active: string;
    role: string;
    permission: string;
    cancel: string;
    confirm: string;
  };
  onClose: () => void;
}

export function RoleFormDialog({
  isOpen,
  labels,
  onClose,
}: RoleFormDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        className="w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-8 shadow-xl"
        style={{ maxHeight: "90dvh" }}
      >
        {/* Title */}
        <h2 className="text-center text-2xl font-bold text-foreground">
          {labels.title}
        </h2>

        <div className="mt-6 space-y-5">
          {/* Activation */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">
              {labels.activation}
            </span>
            <StatusToggle isActive={true} ariaLabel={labels.activation} />
            <span className="text-sm text-muted-foreground">{labels.active}</span>
          </div>

          {/* Role dropdown */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {labels.role}
            </label>
            <div className="relative">
              <select
                defaultValue="sales"
                className="h-11 w-full appearance-none rounded-lg border border-border bg-secondary pe-10 ps-4 text-sm text-foreground shadow-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <SidebarChevronIcon className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Permissions grid — 5 columns */}
          <div className="grid grid-cols-5 gap-x-6 gap-y-3">
            {permissionItems.map((perm) => (
              <label
                key={perm.id}
                className="flex cursor-default items-center gap-2 text-xs text-foreground"
              >
                {/* Custom styled checkbox */}
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                    perm.isChecked
                      ? "border-primary bg-primary"
                      : "border-border bg-card",
                  )}
                >
                  {perm.isChecked && (
                    <CheckIcon className="size-3 text-primary-foreground" />
                  )}
                </span>
                {labels.permission}
              </label>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl border-border text-sm font-semibold text-primary shadow-none"
            onClick={onClose}
          >
            {labels.cancel}
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 rounded-xl text-sm font-semibold text-white hover:text-white"
            onClick={onClose}
          >
            {labels.confirm}
          </Button>
        </div>
      </section>
    </div>
  );
}
