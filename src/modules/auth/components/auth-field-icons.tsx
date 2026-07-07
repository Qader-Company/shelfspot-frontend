import { cn } from "@/shared/lib/utils";

interface AuthIconProps {
  className?: string;
}

const baseClassName = "size-[13px] text-muted-foreground";

export function AuthEmailIcon({ className }: AuthIconProps) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={cn(baseClassName, className)}
    >
      <rect
        x="1.25"
        y="2.25"
        width="11.5"
        height="9.5"
        rx="1.75"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M2.5 4L6.058 6.491a1.7 1.7 0 0 0 1.948 0L11.5 4"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AuthPasswordIcon({ className }: AuthIconProps) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={cn(baseClassName, className)}
    >
      <path
        d="M4.167 6V4.833a2.833 2.833 0 1 1 5.666 0V6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <rect
        x="2.5"
        y="6"
        width="9"
        height="6.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="7" cy="9.25" r="0.9" fill="currentColor" />
    </svg>
  );
}
