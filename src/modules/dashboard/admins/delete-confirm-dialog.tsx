import { WarningIcon } from "@/shared/components/dashboard/dashboard-icons";
import { Button } from "@/shared/ui/button";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  descriptionLine1: string;
  descriptionLine2: string;
  cancelLabel: string;
  confirmLabel: string;
  onClose: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  title,
  descriptionLine1,
  descriptionLine2,
  cancelLabel,
  confirmLabel,
  onClose,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
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
          {title}
        </h2>

        {/* Description */}
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {descriptionLine1}
          <br />
          {descriptionLine2}
        </p>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl border-border text-sm font-semibold shadow-none"
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 rounded-xl bg-destructive text-sm font-semibold text-white hover:bg-destructive/90"
            onClick={onClose}
          >
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
