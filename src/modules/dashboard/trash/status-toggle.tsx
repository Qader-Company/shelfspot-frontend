import { cn } from "@/shared/lib/utils";

interface StatusToggleProps {
  isActive: boolean;
  ariaLabel: string;
}

/**
 * Visual-only toggle switch.
 * Uses logical `start` / `end` utilities so the knob position
 * automatically mirrors in RTL without any extra CSS.
 */
export function StatusToggle({ isActive, ariaLabel }: StatusToggleProps) {
  return (
    <span
      role="switch"
      aria-checked={isActive}
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-default rounded-full transition-colors duration-200",
        isActive ? "bg-success" : "bg-muted-foreground/30",
      )}
    >
      {/* Knob — start-[2px] for OFF, end-[2px] for ON. Logical props auto-flip in RTL. */}
      <span
        className={cn(
          "absolute top-[3px] size-[18px] rounded-full bg-white shadow-sm transition-all duration-200",
          isActive ? "end-[3px]" : "start-[3px]",
        )}
      />
    </span>
  );
}
