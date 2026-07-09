import type { CreateRequestStep } from "@/modules/dashboard/components/create-request.seed";
import { cn } from "@/shared/lib/utils";

interface CreateRequestStepperProps {
  steps: CreateRequestStep[];
  activeStepIndex: number;
  resolveLabel: (key: string) => string;
}

export function CreateRequestStepper({
  steps,
  activeStepIndex,
  resolveLabel,
}: CreateRequestStepperProps) {
  return (
    <ol className="grid gap-3 md:grid-cols-3" aria-label={resolveLabel("createRequest.stepperLabel")}>
      {steps.map((step, index) => {
        const isActive = index === activeStepIndex;
        const isComplete = index < activeStepIndex;

        return (
          <li key={step.key} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                isActive || isComplete
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                "min-w-0 text-xs font-semibold",
                isActive || isComplete
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {resolveLabel(step.titleKey)}
            </span>
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "hidden h-px flex-1 md:block",
                  isComplete ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
