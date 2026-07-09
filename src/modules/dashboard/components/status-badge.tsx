import type { RequestStatus } from "@/modules/dashboard/components/dashboard-overview.seed";
import { cn } from "@/shared/lib/utils";

const statusClasses = {
  inProgress: "bg-[var(--info-50)] text-[var(--info-700)]",
  completed: "bg-[var(--success-50)] text-[var(--success-700)]",
  failed: "bg-[var(--error-50)] text-[var(--error-700)]",
  pending: "bg-[var(--warning-50)] text-[var(--warning-700)]",
} satisfies Record<RequestStatus, string>;

interface StatusBadgeProps {
  status: RequestStatus;
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 text-xs font-semibold",
        statusClasses[status],
      )}
    >
      {label}
    </span>
  );
}
