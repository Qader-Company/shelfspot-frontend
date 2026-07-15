"use client";

import { useEffect, useRef } from "react";

import type { StatusDonutItem } from "@/modules/dashboard/components/dashboard-overview.seed";
import { cn } from "@/shared/lib/utils";

interface StatusDonutChartProps {
  items: Array<StatusDonutItem & { label: string }>;
}

const toneClasses = {
  warning: "bg-warning",
  info: "bg-primary",
  success: "bg-success",
  danger: "bg-destructive",
} satisfies Record<StatusDonutItem["tone"], string>;

export function StatusDonutChart({ items }: StatusDonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;
      const size = Math.min(width, height);
      const styles = getComputedStyle(document.documentElement);
      const colorByTone = {
        warning:
          styles.getPropertyValue("--warning").trim() || "rgb(249, 115, 22)",
        info: styles.getPropertyValue("--primary").trim() || "rgb(86, 203, 242)",
        success:
          styles.getPropertyValue("--success").trim() || "rgb(34, 197, 94)",
        danger:
          styles.getPropertyValue("--destructive").trim() ||
          "rgb(239, 68, 68)",
      } satisfies Record<StatusDonutItem["tone"], string>;
      const drawOrder: StatusDonutItem["key"][] = [
        "completed",
        "pending",
        "failed",
        "inProgress",
      ];
      const orderedItems = drawOrder
        .map((key) => items.find((item) => item.key === key))
        .filter((item): item is StatusDonutItem & { label: string } =>
          Boolean(item),
        );
      const total = orderedItems.reduce(
        (sum, item) => sum + item.value,
        0,
      );
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = size * 0.28;
      const lineWidth = size * 0.14;
      const maxGap = 0.5;
      const startAngle = -2.45;
      let cursor = startAngle;

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.lineWidth = lineWidth;
      context.lineCap = "round";

      if (total === 0) {
        context.strokeStyle = styles.getPropertyValue("--border").trim() || "#e5e7eb";
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.stroke();
        return;
      }

      orderedItems.forEach((item) => {
        const angle = (item.value / total) * Math.PI * 2;
        const gap = Math.min(maxGap, angle * 0.42);
        const start = cursor + gap / 2;
        const end = cursor + angle - gap / 2;

        context.strokeStyle = colorByTone[item.tone];
        context.beginPath();
        context.arc(centerX, centerY, radius, start, end);
        context.stroke();
        cursor += angle;
      });
    };

    draw();

    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, [items]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-7">
      <canvas ref={canvasRef} className="h-48 w-full max-w-64" aria-hidden="true" />
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-[10px] text-foreground">
        {items.map((item) => (
          <span key={item.key} className="inline-flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", toneClasses[item.tone])} />
            {item.label} ({item.value})
          </span>
        ))}
      </div>
    </div>
  );
}
