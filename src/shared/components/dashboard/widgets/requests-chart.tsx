"use client";

import { useEffect, useRef } from "react";

import type { RequestsChartPoint } from "@/shared/components/dashboard/widgets/types";

interface RequestsChartProps {
  data: RequestsChartPoint[];
  months: string[];
}

export function RequestsChart({ data, months }: RequestsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maxValue = Math.max(1, ...data.map((point) => point.value));
  const roundedMax = Math.max(4, Math.ceil(maxValue / 4) * 4);
  const yAxisLabels = Array.from(
    { length: 5 },
    (_, index) => roundedMax - (roundedMax / 4) * index,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;
      const styles = getComputedStyle(document.documentElement);
      const primary = styles.getPropertyValue("--primary").trim() || "#56cbf2";
      const points = data.map((point, index) => ({
        x: data.length === 1 ? width / 2 : (index / (data.length - 1)) * width,
        y: height - (point.value / roundedMax) * height,
      }));

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      if (points.length === 0) return;
      context.lineWidth = 3;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = primary;
      context.globalAlpha = 0.92;
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);

      for (let index = 0; index < points.length - 1; index += 1) {
        const point = points[index];
        const next = points[index + 1];
        const controlX = (point.x + next.x) / 2;
        context.bezierCurveTo(
          controlX,
          point.y,
          controlX,
          next.y,
          next.x,
          next.y,
        );
      }

      context.stroke();

      const focusIndex = data.reduce(
        (highest, point, index) =>
          point.value > data[highest].value ? index : highest,
        0,
      );
      const focusPoint = points[focusIndex];
      context.globalAlpha = 1;
      context.fillStyle = primary;
      context.beginPath();
      context.arc(focusPoint.x, focusPoint.y, 6, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "rgba(86, 203, 242, 0.28)";
      context.lineWidth = 8;
      context.beginPath();
      context.arc(focusPoint.x, focusPoint.y, 6, 0, Math.PI * 2);
      context.stroke();
    };

    draw();
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [data, roundedMax]);

  return (
    <div className="grid h-56 grid-cols-[2.5rem_1fr] gap-3">
      <div className="flex flex-col justify-between pb-7 text-[11px] text-muted-foreground">
        {yAxisLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="relative">
        <div className="absolute inset-x-0 top-0 bottom-7 flex flex-col justify-between">
          {yAxisLabels.map((label) => (
            <span key={label} className="border-t border-border" />
          ))}
        </div>
        <div className="absolute inset-x-0 top-0 bottom-7">
          <canvas ref={canvasRef} className="size-full" aria-hidden="true" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex justify-between text-[11px] text-muted-foreground">
          {months.map((month, index) => (
            <span key={`${month}-${index}`}>{month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
