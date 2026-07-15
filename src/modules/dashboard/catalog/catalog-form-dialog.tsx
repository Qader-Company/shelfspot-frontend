import type { ReactNode } from "react";

import { CloseIcon } from "@/shared/components/dashboard/dashboard-icons";
import { StatusToggle } from "@/shared/components/dashboard/status-toggle";
import { Button } from "@/shared/ui/button";

interface CatalogFormDialogProps {
  isOpen: boolean;
  title: string;
  closeLabel: string;
  cancelLabel: string;
  saveLabel: string;
  onClose: () => void;
  onSubmit?: () => void;
  isPending?: boolean;
  errorMessage?: string;
  children: ReactNode;
}

export function CatalogFormDialog({
  isOpen,
  title,
  closeLabel,
  cancelLabel,
  saveLabel,
  onClose,
  onSubmit,
  isPending = false,
  errorMessage,
  children,
}: CatalogFormDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl"
        style={{ maxHeight: "90dvh" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={closeLabel}
            className="rounded-full text-muted-foreground"
            onClick={onClose}
          >
            <CloseIcon className="size-4" />
          </Button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (onSubmit) onSubmit();
            else onClose();
          }}
        >
          <div className="mt-5 space-y-4">{children}</div>

          {errorMessage ? (
            <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}

          {/* Footer actions */}
          <div className="mt-6 flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-xl border-border text-sm font-semibold shadow-none"
              onClick={onClose}
              disabled={isPending}
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              className="h-11 flex-1 rounded-xl text-sm font-semibold text-white hover:text-white"
              disabled={isPending}
            >
              {saveLabel}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

// ─── Status field reused inside every catalog form ──────────────────────────

interface CatalogStatusFieldProps {
  activeLabel: string;
  description: string;
  ariaLabel: string;
  isActive?: boolean;
  onChange?: (isActive: boolean) => void;
}

export function CatalogStatusField({
  activeLabel,
  description,
  ariaLabel,
  isActive = true,
  onChange,
}: CatalogStatusFieldProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{activeLabel}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange?.(!isActive)}
        disabled={!onChange}
        className="rounded-full disabled:cursor-default"
      >
        <StatusToggle isActive={isActive} ariaLabel={ariaLabel} />
      </button>
    </div>
  );
}

// ─── Select field reused in every catalog form ───────────────────────────────

interface CatalogSelectFieldProps {
  label: string;
  placeholder: string;
  options: readonly string[];
}

export function CatalogSelectField({
  label,
  placeholder,
  options,
}: CatalogSelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <div className="relative">
        <select
          defaultValue=""
          className="h-11 w-full appearance-none rounded-lg border border-border bg-secondary pe-8 ps-4 text-sm text-foreground shadow-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}
