"use client";

import { useEffect, useRef, useState } from "react";

interface StatisticCardProps {
  label: string;
  value: string;
}

export function StatisticCard({
  label,
  value,
}: StatisticCardProps) {
  const hasPercentSuffix = value.endsWith("%");
  const hasPlusPrefix = value.startsWith("+");
  const numericValue = hasPercentSuffix ? value.slice(0, -1) : value;
  const digits = hasPlusPrefix ? numericValue.slice(1) : numericValue;
  const targetValue = Number.parseInt(digits, 10);
  const [displayValue, setDisplayValue] = useState(0);
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = valueRef.current;
    if (!element || Number.isNaN(targetValue)) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      const reducedMotionFrame = requestAnimationFrame(() => {
        setDisplayValue(targetValue);
      });

      return () => cancelAnimationFrame(reducedMotionFrame);
    }

    let animationFrame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(animationFrame);

        if (!entry.isIntersecting) {
          setDisplayValue(0);
          return;
        }

        const startedAt = performance.now();
        const duration = 1500;

        const update = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          setDisplayValue(Math.round(targetValue * easedProgress));

          if (progress < 1) {
            animationFrame = requestAnimationFrame(update);
          }
        };

        animationFrame = requestAnimationFrame(update);
      },
      { threshold: 0.45 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [targetValue]);

  return (
    <article className="flex flex-col items-center gap-3 text-center">
      <p className="text-[clamp(2rem,3.4vw,3rem)] leading-none font-bold text-foreground">
        {hasPlusPrefix ? <span className="text-primary">+</span> : null}
        <span ref={valueRef}>{displayValue}</span>
        {hasPercentSuffix ? <span className="text-primary">%</span> : null}
      </p>

      <p className="max-w-[220px] text-[clamp(0.875rem,1.2vw,1rem)] font-medium text-foreground">
        {label}
      </p>
    </article>
  );
}
