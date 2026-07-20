import { WarningIcon } from "@/shared/components/dashboard/dashboard-icons";
import { Button } from "@/shared/ui/button";

interface RequestDeleteDialogProps {
  isOpen: boolean;
  requestId: string;
  labels: {
    title: string;
    description: string;
    reasonLabel: string;
    reasonPlaceholder: string;
    reasons: { value: string; label: string }[];
    cancel: string;
    confirm: string;
  };
  onClose: () => void;
}

export function RequestDeleteDialog({
  isOpen,
  requestId,
  labels,
  onClose,
}: RequestDeleteDialogProps) {
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
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl"
      >
        {/* Warning icon */}
        <div className="flex justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
            <WarningIcon className="size-7 text-destructive" />
          </span>
        </div>

        {/* Title */}
        <h2 className="mt-4 text-center text-xl font-bold text-foreground">
          {labels.title}
        </h2>

        {/* Description */}
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {labels.description.replace("{id}", requestId)}
        </p>

        {/* Deletion reason */}
        <div className="mt-5 space-y-1.5">
          <label className="text-sm font-semibold text-foreground">
            {labels.reasonLabel}{" "}
            <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <select
              defaultValue=""
              className="h-11 w-full appearance-none rounded-lg border border-border bg-card pe-8 ps-4 text-sm text-muted-foreground shadow-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="" disabled>
                {labels.reasonPlaceholder}
              </option>
              {labels.reasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
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

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl border-border text-sm font-semibold shadow-none"
            onClick={onClose}
          >
            {labels.cancel}
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 rounded-xl bg-destructive text-sm font-semibold text-white hover:bg-destructive/90"
            onClick={onClose}
          >
            {labels.confirm}
          </Button>
        </div>
      </section>
    </div>
  );
}
