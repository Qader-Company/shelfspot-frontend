import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import type { DashboardStatItem } from "@/modules/dashboard/components/dashboard-overview.seed";
import { cn } from "@/shared/lib/utils";

const toneClasses = {
  info: {
    icon: "bg-primary/15 text-primary",
    trend: "text-primary",
  },
  success: {
    icon: "bg-success/15 text-success",
    trend: "text-success",
  },
  danger: {
    icon: "bg-destructive/15 text-destructive",
    trend: "text-destructive",
  },
  purple: {
    icon: "bg-[var(--dashboard-avatar-background)]",
    trend: "text-accent-foreground",
  },
} satisfies Record<DashboardStatItem["tone"], { icon: string; trend: string }>;

interface DashboardStatCardProps {
  item: DashboardStatItem;
  title: string;
  trend: string;
}

export function DashboardStatCard({
  item,
  title,
  trend,
}: DashboardStatCardProps) {
  const tone = toneClasses[item.tone];
  const changePercentage = item.changePercentage ?? 0;

  return (
    <article className="flex min-h-24 items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-lg shadow-foreground/5">
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full",
          tone.icon,
        )}
      >
        <Image src={item.iconSrc} alt="" width={24} height={24} className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-normal text-muted-foreground">
          {title}
        </p>
        <div className="mt-1 flex flex-wrap items-end gap-x-2 gap-y-1">
          <p className="text-2xl font-bold leading-none text-foreground">
            {item.value}
          </p>
          <p className={cn("flex items-center gap-1 text-[10px]", tone.trend)}>
            {trend}
            {changePercentage === 0 ? (
              <ArrowRight className="size-3" />
            ) : (
              <ArrowUpRight
                className={cn(
                  "size-3",
                  changePercentage < 0 && "rotate-90",
                )}
              />
            )}
          </p>
        </div>
      </div>
    </article>
  );
}
