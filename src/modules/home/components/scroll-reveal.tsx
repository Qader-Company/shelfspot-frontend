"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "left" | "right" | "scale";
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  variant = "up",
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.unobserve(entry.target);
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={cn(
        "scroll-reveal",
        `scroll-reveal-${variant}`,
        isVisible && "scroll-reveal-visible",
        className,
      )}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
