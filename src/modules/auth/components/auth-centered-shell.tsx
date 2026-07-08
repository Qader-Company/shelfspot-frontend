import Image from "next/image";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";

interface AuthCenteredShellProps {
  backHref: string;
  backLabel: string;
  children: ReactNode;
  className?: string;
  direction: "rtl" | "ltr";
  imageClassName?: string;
  visualAlt: string;
  visualHeight?: number;
  visualSrc: string;
  visualWidth?: number;
}

export function AuthCenteredShell({
  backHref,
  backLabel,
  children,
  className,
  direction,
  imageClassName,
  visualAlt,
  visualHeight = 140,
  visualSrc,
  visualWidth = 140,
}: AuthCenteredShellProps) {
  return (
    <main className="relative min-h-dvh bg-background px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href={backHref}
        aria-label={backLabel}
        className="absolute top-12 inline-flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground sm:top-14"
        style={{ insetInlineStart: "1.5rem" }}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="size-4"
          style={{
            transform: direction === "rtl" ? "scaleX(-1)" : undefined,
          }}
        >
          <path
            d="M12.5 5 7.5 10l5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      <div className="flex min-h-[calc(100dvh-6rem)] items-center justify-center">
        <div
          className={cn(
            "flex h-[503px] w-full max-w-[598px] flex-col items-center justify-center gap-8",
            className,
          )}
        >
          <div className="mx-auto flex w-full max-w-[400px] flex-col items-center">
            <Image
              src={visualSrc}
              alt={visualAlt}
              width={visualWidth}
              height={visualHeight}
              priority
              className={cn("h-auto object-contain", imageClassName)}
            />

            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
