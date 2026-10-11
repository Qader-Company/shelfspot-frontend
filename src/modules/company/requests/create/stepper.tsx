"use client";

import { useLocale } from "next-intl";
import { CalendarDays, Layers3 } from "lucide-react";
import type { CreateRequestStep } from "@/modules/company/requests/create/seed";
import { cn } from "@/shared/lib/utils";

interface CreateRequestStepperProps {
  steps: CreateRequestStep[];
  activeStepIndex: number;
  resolveLabel: (key: string) => string;
  onStepClick?: (index: number) => void;
}

export function CreateRequestStepper({ steps, activeStepIndex, resolveLabel, onStepClick }: CreateRequestStepperProps) {
  const rtl = useLocale() === "ar";
  return <nav aria-label={resolveLabel("createRequest.stepperLabel")} className="relative isolate grid w-full grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
    <span aria-hidden="true" className="pointer-events-none absolute inset-y-2 start-2 w-[calc((100%-1.5rem)/2)] rounded-xl bg-primary shadow-md transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none" style={{ transform: activeStepIndex === 0 ? "translateX(0)" : `translateX(calc(${rtl ? "-100% -" : "100% +"} 0.5rem))` }} />
    {steps.map((step, index) => {
      const active = index === activeStepIndex;
      const Icon = step.key === "location" ? CalendarDays : Layers3;
      return <button key={step.key} type="button" aria-current={active ? "step" : undefined} onClick={() => onStepClick?.(index)} className={cn(
        "relative z-10 flex min-h-16 min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-3 text-center text-sm font-semibold outline-none transition-[background-color,color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:gap-3 sm:px-6 sm:text-base motion-reduce:transition-none",
        active ? "text-primary-foreground" : "text-muted-foreground hover:text-primary",
      )}>
        <Icon aria-hidden="true" className={cn("hidden size-5 shrink-0 transition-transform duration-300 sm:block motion-reduce:transition-none", active ? "scale-110" : "scale-100")} />
        <span>{resolveLabel(step.titleKey)}</span>
      </button>;
    })}
  </nav>;
}
