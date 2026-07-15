import { cn } from "@/shared/lib/utils";

interface NotificationVisualIconProps {
  className?: string;
}

export function HiringRequestIcon({ className }: NotificationVisualIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block size-6 text-primary before:absolute before:start-1 before:top-2 before:h-2 before:w-3 before:rounded-s-full before:border-4 before:border-e-0 before:border-current after:absolute after:start-1 after:top-[0.45rem] after:size-2 after:rotate-45 after:border-b-4 after:border-s-4 after:border-current",
        className,
      )}
    />
  );
}

export function AssignmentRejectedIcon({
  className,
}: NotificationVisualIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-6 items-center justify-center rounded-md bg-destructive text-base font-bold leading-none text-destructive-foreground",
        className,
      )}
    >
      !
    </span>
  );
}

export function FreelancerAssignedIcon({
  className,
}: NotificationVisualIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative block size-6 text-success", className)}
    >
      <span className="absolute start-2 top-0 size-3 rounded-full bg-current" />
      <span className="absolute start-[0.2rem] top-4 h-2.5 w-5 rounded-t-full bg-current" />
    </span>
  );
}

export function WalletCreditedIcon({ className }: NotificationVisualIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block size-6 rounded-md bg-[var(--dashboard-avatar-foreground)] before:absolute before:start-0 before:top-1 before:h-1 before:w-4 before:rounded-t-md before:bg-[var(--dashboard-avatar-foreground)] after:absolute after:end-1.5 after:top-3 after:size-1.5 after:rounded-full after:bg-primary-foreground",
        className,
      )}
    />
  );
}
