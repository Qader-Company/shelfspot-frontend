"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const contentId = `faq-content-${index}`;
        const triggerId = `faq-trigger-${index}`;

        return (
          <article
            key={item.question}
            className={`overflow-hidden rounded-2xl border bg-background shadow-sm transition-[border-color,box-shadow,transform] duration-300 ${
              isOpen
                ? "border-primary/40 shadow-md"
                : "border-border/70 hover:-translate-y-0.5 hover:border-primary/25"
            }`}
          >
            <button
              id={triggerId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={contentId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-5 p-5 text-start sm:p-6"
            >
              <span className="text-base font-semibold sm:text-lg">{item.question}</span>
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${isOpen ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                <ChevronDown className={`size-4 transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : "rotate-0"}`} />
              </span>
            </button>

            <div
              id={contentId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="mx-5 border-t border-border/60 pb-5 pt-4 text-sm leading-7 text-foreground/70 sm:mx-6 sm:pb-6 sm:text-base">
                  {item.answer}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
