"use client";

import type { ReactNode } from "react";

import { CloseIcon } from "@/shared/components/dashboard/dashboard-icons";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

interface FlowDialogProps {
  title: string;
  closeLabel: string;
  isOpen: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  onClose: () => void;
}

export function FlowDialog({
  title,
  closeLabel,
  isOpen,
  children,
  footer,
  className,
  onClose,
}: FlowDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="dialog-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "dialog-panel-in w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-muted-foreground"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <CloseIcon className="size-4" />
          </Button>
        </div>

        <div className="mt-5">{children}</div>

        {footer ? <div className="mt-5">{footer}</div> : null}
      </section>
    </div>
  );
}
