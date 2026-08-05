"use client";

import { useState } from "react";

import { TimelineStepCard } from "@/modules/home/components/timeline-step-card";
import { cn } from "@/shared/lib/utils";

interface TimelineStep {
  description: string;
  id: string;
  side: "left" | "right";
  title: string;
}

interface InteractiveTimelineProps {
  steps: TimelineStep[];
}

export function InteractiveTimeline({ steps }: InteractiveTimelineProps) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="relative mt-8 lg:mt-10">
      <div className="timeline-line absolute inset-x-1/2 hidden h-full w-px -translate-x-1/2 bg-accent md:block" />

      <div className="flex flex-col gap-6 md:gap-2">
        {steps.map((step, index) => {
          const isLeft = step.side === "left";
          const isActive = activeStep === index;
          const selectStep = () => setActiveStep(index);

          const card = (
            <button
              type="button"
              aria-pressed={isActive}
              onClick={selectStep}
              className="timeline-card-trigger block w-full cursor-pointer rounded-[20px] border-0 bg-transparent p-0 text-inherit sm:rounded-[28px]"
            >
              <TimelineStepCard
                title={step.title}
                description={step.description}
              />
            </button>
          );

          return (
            <div
              key={step.id}
              dir="ltr"
              className={cn(
                "scroll-reveal-card timeline-row grid items-center gap-5 md:grid-cols-[1fr_auto_1fr] md:gap-10",
                isActive && "timeline-row-active",
              )}
              style={{ transitionDelay: `${120 + index * 160}ms` }}
            >
              <div className={cn("hidden md:block", isLeft ? "" : "invisible")}>
                {isLeft ? card : null}
              </div>

              <div className="relative z-10 flex justify-center">
                <button
                  type="button"
                  aria-label={`${index + 1}. ${step.title}`}
                  aria-pressed={isActive}
                  onClick={selectStep}
                  className={cn(
                    "timeline-node flex size-8 items-center justify-center rounded-full border-2 border-primary text-base font-medium",
                    isActive
                      ? "bg-primary text-white"
                      : "bg-card text-primary",
                  )}
                >
                  {index + 1}
                </button>
              </div>

              <div className={cn("hidden md:block", isLeft ? "invisible" : "")}>
                {!isLeft ? card : null}
              </div>

              <div className="md:hidden">{card}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
