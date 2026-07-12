import { Button } from "@/shared/ui/button";

interface StepNavigationProps {
  backLabel: string;
  cancelLabel: string;
  nextLabel: string;
  submitLabel: string;
  canGoBack: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onCancel: () => void;
  onNext: () => void | Promise<void>;
}

export function StepNavigation({
  backLabel,
  cancelLabel,
  nextLabel,
  submitLabel,
  canGoBack,
  isLastStep,
  onBack,
  onCancel,
  onNext,
}: StepNavigationProps) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {canGoBack ? (
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-border bg-card px-5 text-sm font-semibold shadow-none"
            onClick={onBack}
          >
            {backLabel}
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-lg border-border bg-card px-5 text-sm font-semibold shadow-none"
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          className="h-10 rounded-lg px-5 text-sm font-semibold text-primary-foreground hover:text-primary-foreground"
          onClick={onNext}
        >
          {isLastStep ? submitLabel : nextLabel}
        </Button>
      </div>
    </div>
  );
}
