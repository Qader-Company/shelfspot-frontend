"use client";

import { useEffect, useRef } from "react";

import type { RequestsChartPoint } from "@/modules/dashboard/components/dashboard-overview.seed";

interface RequestsChartProps {
  data: RequestsChartPoint[];
  months: string[];
}

export function RequestsChart({ data, months }: RequestsChartProps) {
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
      const dataMax = Math.max(...data.map((point) => point.value), 0);
      const maxValue = Math.max(1, Math.ceil(dataMax / 4) * 4);
      const styles = getComputedStyle(document.documentElement);
      const primary = styles.getPropertyValue("--primary").trim() || "#56cbf2";
      const points = data.map((point, index) => ({
        x: data.length === 1 ? width / 2 : (index / (data.length - 1)) * width,
        y: height - (point.value / maxValue) * height,
      }));

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.lineWidth = 3;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = primary;
      context.globalAlpha = 0.92;
      context.beginPath();
      if (!points.length) return;
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

      const focusPoint = points.reduce((highest, point) =>
        point.y < highest.y ? point : highest,
      );
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
  }, [data]);

  const dataMax = Math.max(...data.map((point) => point.value), 0);
  const maxValue = Math.max(1, Math.ceil(dataMax / 4) * 4);
  const yAxisLabels = [maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0];

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
          {months.map((month) => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
