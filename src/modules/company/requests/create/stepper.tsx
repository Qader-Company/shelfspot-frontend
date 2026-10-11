"use client";

import { Check } from "lucide-react";
import type { CreateRequestStep } from "@/modules/company/requests/create/seed";
import { cn } from "@/shared/lib/utils";

interface CreateRequestStepperProps {
  steps: CreateRequestStep[];
  activeStepIndex: number;
  resolveLabel: (key: string) => string;
  onStepClick?: (index: number) => void;
}

export function CreateRequestStepper({ steps, activeStepIndex, resolveLabel, onStepClick }: CreateRequestStepperProps) {
  return <nav aria-label={resolveLabel("createRequest.stepperLabel")} className="relative w-full py-1">
    <span aria-hidden="true" className="pointer-events-none absolute inset-x-1/4 top-[18px] h-0.5 overflow-hidden rounded-full bg-border">
      <span className={cn("block h-full origin-left bg-primary transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] rtl:origin-right motion-reduce:transition-none", activeStepIndex > 0 ? "scale-x-100" : "scale-x-0")} />
    </span>
    <ol className="relative grid grid-cols-2 gap-3">
      {steps.map((step, index) => {
        const active = index === activeStepIndex;
        const complete = index < activeStepIndex;
        return <li key={step.key} className="min-w-0">
          <button type="button" aria-current={active ? "step" : undefined} onClick={() => onStepClick?.(index)} className="group flex w-full flex-col items-center gap-2 rounded-lg px-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-4 ring-background transition-[background-color,color,box-shadow,transform] duration-300 motion-reduce:transition-none", active ? "scale-110 bg-primary text-primary-foreground shadow-sm" : complete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary")}>
              {complete ? <Check aria-hidden="true" className="size-3.5" /> : index + 1}
            </span>
            <span className={cn("text-xs font-semibold transition-colors duration-300 sm:text-sm motion-reduce:transition-none", active ? "text-primary" : "text-muted-foreground group-hover:text-primary")}>{resolveLabel(step.titleKey)}</span>
          </button>
        </li>;
      })}
    </ol>
  </nav>;
}
