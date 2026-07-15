import { cn } from "@/shared/lib/utils";

export type StatusBadgeStatus =
  | "inProgress"
  | "completed"
  | "inReview"
  | "accepted"
  | "failed"
  | "rejected"
  | "canceled"
  | "pending"
  | "refunded"
  | "active"
  | "inactive"
  | "reopened";

const statusClasses = {
  inProgress: "bg-[var(--info-50)] text-[var(--info-700)]",
  completed: "bg-[var(--success-50)] text-[var(--success-700)]",
  inReview: "bg-[var(--success-50)] text-[var(--success-700)]",
  accepted: "bg-[var(--success-50)] text-[var(--success-700)]",
  failed: "bg-[var(--error-50)] text-[var(--error-700)]",
  rejected: "bg-[var(--error-50)] text-[var(--error-700)]",
  canceled: "bg-[var(--error-50)] text-[var(--error-700)]",
  pending:  "bg-[var(--warning-50)] text-[var(--warning-700)]",
  refunded: "bg-[var(--warning-50)] text-[var(--warning-700)]",
  active:   "bg-[var(--info-50)] text-[var(--info-700)]",
  inactive: "bg-[var(--error-50)] text-[var(--error-700)]",
  reopened: "bg-[var(--success-50)] text-[var(--success-700)]",
} satisfies Record<StatusBadgeStatus, string>;

interface StatusBadgeProps {
  status: StatusBadgeStatus;
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
