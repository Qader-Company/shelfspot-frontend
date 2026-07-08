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

export function AuthCompanyIcon({ className }: AuthIconProps) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={cn(baseClassName, className)}
    >
      <path
        d="M2.5 11.5V3.25A1.25 1.25 0 0 1 3.75 2h4.5A1.25 1.25 0 0 1 9.5 3.25V11.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 5.5H11a.75.75 0 0 1 .75.75v5.25"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 4.5h1m-1 2h1m2-2h1m-1 2h1m-4 5V9.5h3V11.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AuthCrIcon({ className }: AuthIconProps) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={cn(baseClassName, className)}
    >
      <path
        d="M2.25 3.5h2.5M2.25 7h2.5M2.25 10.5h2.5M6.5 3.5h5.25M6.5 7h5.25M6.5 10.5h5.25"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M4 2.25v9.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AuthPhoneIcon({ className }: AuthIconProps) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={cn(baseClassName, className)}
    >
      <rect x="1.5" y="2.5" width="11" height="8" rx="1" fill="#0B6D3B" />
      <path
        d="M4.25 4.5v4m.9-3.2-.9.7m0 0-.9-.7m.9.7.9.7"
        stroke="#FFFFFF"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 6.15h2.7M8.2 7.4h2.7"
        stroke="#FFFFFF"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AuthIndustryIcon({ className }: AuthIconProps) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={cn(baseClassName, className)}
    >
      <path
        d="M3 5.25c0-.97 1.79-1.75 4-1.75s4 .78 4 1.75S9.21 7 7 7 3 6.22 3 5.25Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M3 5.25V8.5c0 .97 1.79 1.75 4 1.75s4-.78 4-1.75V5.25"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M4.25 2.75v1.5M9.75 2.75v1.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AuthChevronDownIcon({ className }: AuthIconProps) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={cn(baseClassName, className)}
    >
      <path
        d="m3.5 5.5 3.5 3 3.5-3"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
